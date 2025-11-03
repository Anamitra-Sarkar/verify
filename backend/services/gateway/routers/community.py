"""
Community router - handles leaderboard, badges, and discussions.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta

from ...shared.database.session import get_db
from ...shared.database.models import User, Detection, Report, DetectionVerdict
from ...shared.database.community_models import (
    UserContribution, Discussion, DiscussionReply, 
    DiscussionLike, ReplyLike, UserBadge
)
from ...shared.auth.jwt import get_current_user

router = APIRouter(prefix="/community", tags=["community"])


# Pydantic models
class LeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    name: str
    points: int
    badge: str
    verified: int
    accuracy: int
    avatar: str
    
    class Config:
        from_attributes = True


class UserStats(BaseModel):
    user_id: int
    level: int
    xp_current: int
    xp_required: int
    total_reports: int
    accuracy: int
    current_rank: int
    rank_change: int
    streak_days: int
    
    class Config:
        from_attributes = True


class BadgeInfo(BaseModel):
    name: str
    description: str
    rarity: str
    color: str
    bgColor: str
    earned: bool
    earned_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class DiscussionCreate(BaseModel):
    title: str
    content: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[str] = None


class DiscussionResponse(BaseModel):
    id: int
    title: str
    author: str
    author_id: int
    replies: int
    likes: int
    views: int
    timeAgo: str
    category: Optional[str] = None
    tags: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class ReplyCreate(BaseModel):
    content: str


class ReplyResponse(BaseModel):
    id: int
    discussion_id: int
    author: str
    author_id: int
    content: str
    likes: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Helper functions
def calculate_time_ago(created_at: datetime) -> str:
    """Calculate human-readable time ago string."""
    now = datetime.utcnow()
    diff = now - created_at
    
    if diff.days > 30:
        months = diff.days // 30
        return f"{months} month{'s' if months > 1 else ''} ago"
    elif diff.days > 0:
        return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
    elif diff.seconds > 3600:
        hours = diff.seconds // 3600
        return f"{hours} hour{'s' if hours > 1 else ''} ago"
    elif diff.seconds > 60:
        minutes = diff.seconds // 60
        return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
    else:
        return "just now"


def get_user_avatar_initials(username: str, full_name: Optional[str] = None) -> str:
    """Get avatar initials from username or full name."""
    if full_name:
        parts = full_name.split()
        if len(parts) >= 2:
            return (parts[0][0] + parts[1][0]).upper()
        return full_name[:2].upper()
    return username[:2].upper()


def update_user_contribution(db: Session, user_id: int):
    """Update user contribution stats based on their activity."""
    # Get or create contribution record
    contrib = db.query(UserContribution).filter(
        UserContribution.user_id == user_id
    ).first()
    
    if not contrib:
        contrib = UserContribution(user_id=user_id)
        db.add(contrib)
    
    # Count user's detections and reports
    total_detections = db.query(func.count(Detection.id)).filter(
        Detection.user_id == user_id
    ).scalar() or 0
    
    verified_reports = db.query(func.count(Report.id)).filter(
        Report.user_id == user_id,
        Report.verified == True
    ).scalar() or 0
    
    total_reports = db.query(func.count(Report.id)).filter(
        Report.user_id == user_id
    ).scalar() or 0
    
    # Calculate accuracy
    if total_reports > 0:
        accuracy = int((verified_reports / total_reports) * 100)
    else:
        accuracy = 0
    
    # Calculate points (10 points per detection, 50 per verified report)
    points = (total_detections * 10) + (verified_reports * 50)
    
    # Update stats
    contrib.total_reports = total_reports
    contrib.verified_reports = verified_reports
    contrib.accuracy_percentage = accuracy
    contrib.total_points = points
    contrib.last_activity = datetime.utcnow()
    
    # Calculate level and XP
    level = 1 + (points // 1000)
    xp_current = points % 1000
    xp_required = 1000
    
    contrib.level = level
    contrib.xp_current = xp_current
    contrib.xp_required = xp_required
    
    # Assign badge based on performance
    if verified_reports >= 500 and accuracy >= 95:
        contrib.badge_name = "Guardian Elite"
    elif verified_reports >= 250:
        contrib.badge_name = "Top Reporter"
    elif total_reports >= 100:
        contrib.badge_name = "Rising Star"
    else:
        contrib.badge_name = "Beginner"
    
    db.commit()
    db.refresh(contrib)
    
    return contrib


# Endpoints
@router.get("/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(
    limit: int = Query(default=50, le=100),
    db: Session = Depends(get_db)
):
    """Get leaderboard of top contributors."""
    try:
        # Get all contributions sorted by points
        contribs = db.query(UserContribution, User).join(
            User, UserContribution.user_id == User.id
        ).order_by(desc(UserContribution.total_points)).limit(limit).all()
        
        leaderboard = []
        for rank, (contrib, user) in enumerate(contribs, start=1):
            # Update rank
            contrib.current_rank = rank
            
            leaderboard.append(LeaderboardEntry(
                rank=rank,
                user_id=user.id,
                name=user.full_name or user.username,
                points=contrib.total_points,
                badge=contrib.badge_name or "Beginner",
                verified=contrib.verified_reports,
                accuracy=contrib.accuracy_percentage,
                avatar=get_user_avatar_initials(user.username, user.full_name)
            ))
        
        db.commit()
        return leaderboard
    except Exception as e:
        # Database not configured or error - return empty list
        print(f"Leaderboard error: {e}")
        return []


@router.get("/stats/me", response_model=UserStats)
async def get_my_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's stats."""
    # Update contribution stats
    contrib = update_user_contribution(db, current_user.id)
    
    # Calculate rank change (simplified - would need historical data for real implementation)
    rank_change = 0  # Placeholder
    
    return UserStats(
        user_id=current_user.id,
        level=contrib.level,
        xp_current=contrib.xp_current,
        xp_required=contrib.xp_required,
        total_reports=contrib.total_reports,
        accuracy=contrib.accuracy_percentage,
        current_rank=contrib.current_rank or 999,
        rank_change=rank_change,
        streak_days=contrib.streak_days
    )


@router.get("/badges", response_model=List[BadgeInfo])
async def get_badges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all available badges and user's earned status."""
    # Get user's earned badges
    user_badges = db.query(UserBadge).filter(
        UserBadge.user_id == current_user.id
    ).all()
    
    earned_badge_names = {badge.badge_name for badge in user_badges}
    
    # Define all available badges
    all_badges = [
        {
            "name": "Guardian Elite",
            "description": "Verified 500+ reports with 95%+ accuracy",
            "rarity": "Legendary",
            "color": "text-purple-600",
            "bgColor": "bg-purple-50 dark:bg-purple-950"
        },
        {
            "name": "Truth Seeker",
            "description": "Active for 6+ months with consistent contributions",
            "rarity": "Epic",
            "color": "text-yellow-600",
            "bgColor": "bg-yellow-50 dark:bg-yellow-950"
        },
        {
            "name": "Fact Champion",
            "description": "Top 100 contributors this month",
            "rarity": "Rare",
            "color": "text-blue-600",
            "bgColor": "bg-blue-50 dark:bg-blue-950"
        },
        {
            "name": "Top Reporter",
            "description": "Submitted 250+ accurate reports",
            "rarity": "Rare",
            "color": "text-green-600",
            "bgColor": "bg-green-50 dark:bg-green-950"
        },
        {
            "name": "Vigilant Eye",
            "description": "First to report 50+ viral misinformation",
            "rarity": "Uncommon",
            "color": "text-orange-600",
            "bgColor": "bg-orange-50 dark:bg-orange-950"
        },
        {
            "name": "Community Hero",
            "description": "Helped educate 1000+ users",
            "rarity": "Epic",
            "color": "text-pink-600",
            "bgColor": "bg-pink-50 dark:bg-pink-950"
        }
    ]
    
    result = []
    for badge_def in all_badges:
        earned = badge_def["name"] in earned_badge_names
        earned_at = None
        
        if earned:
            user_badge = next((b for b in user_badges if b.badge_name == badge_def["name"]), None)
            if user_badge:
                earned_at = user_badge.earned_at
        
        result.append(BadgeInfo(
            **badge_def,
            earned=earned,
            earned_at=earned_at
        ))
    
    return result


@router.get("/discussions", response_model=List[DiscussionResponse])
async def get_discussions(
    category: Optional[str] = None,
    limit: int = Query(default=20, le=50),
    db: Session = Depends(get_db)
):
    """Get recent discussions."""
    query = db.query(Discussion, User).join(
        User, Discussion.user_id == User.id, isouter=True
    )
    
    if category:
        query = query.filter(Discussion.category == category)
    
    discussions = query.order_by(desc(Discussion.created_at)).limit(limit).all()
    
    result = []
    for disc, user in discussions:
        result.append(DiscussionResponse(
            id=disc.id,
            title=disc.title,
            author=user.full_name or user.username if user else "Anonymous",
            author_id=user.id if user else 0,
            replies=disc.reply_count,
            likes=disc.like_count,
            views=disc.view_count,
            timeAgo=calculate_time_ago(disc.created_at),
            category=disc.category,
            tags=disc.tags,
            created_at=disc.created_at
        ))
    
    return result


@router.post("/discussions", response_model=DiscussionResponse)
async def create_discussion(
    discussion: DiscussionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new discussion."""
    new_discussion = Discussion(
        user_id=current_user.id,
        title=discussion.title,
        content=discussion.content,
        category=discussion.category,
        tags=discussion.tags
    )
    
    db.add(new_discussion)
    db.commit()
    db.refresh(new_discussion)
    
    return DiscussionResponse(
        id=new_discussion.id,
        title=new_discussion.title,
        author=current_user.full_name or current_user.username,
        author_id=current_user.id,
        replies=0,
        likes=0,
        views=0,
        timeAgo="just now",
        category=new_discussion.category,
        tags=new_discussion.tags,
        created_at=new_discussion.created_at
    )


@router.get("/discussions/{discussion_id}/replies", response_model=List[ReplyResponse])
async def get_discussion_replies(
    discussion_id: int,
    db: Session = Depends(get_db)
):
    """Get replies for a discussion."""
    replies = db.query(DiscussionReply, User).join(
        User, DiscussionReply.user_id == User.id, isouter=True
    ).filter(
        DiscussionReply.discussion_id == discussion_id
    ).order_by(DiscussionReply.created_at).all()
    
    result = []
    for reply, user in replies:
        result.append(ReplyResponse(
            id=reply.id,
            discussion_id=reply.discussion_id,
            author=user.full_name or user.username if user else "Anonymous",
            author_id=user.id if user else 0,
            content=reply.content,
            likes=reply.like_count,
            created_at=reply.created_at
        ))
    
    return result


@router.post("/discussions/{discussion_id}/replies", response_model=ReplyResponse)
async def create_reply(
    discussion_id: int,
    reply: ReplyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a reply to a discussion."""
    # Check if discussion exists
    discussion = db.query(Discussion).filter(Discussion.id == discussion_id).first()
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")
    
    new_reply = DiscussionReply(
        discussion_id=discussion_id,
        user_id=current_user.id,
        content=reply.content
    )
    
    db.add(new_reply)
    
    # Update discussion reply count
    discussion.reply_count += 1
    
    db.commit()
    db.refresh(new_reply)
    
    return ReplyResponse(
        id=new_reply.id,
        discussion_id=new_reply.discussion_id,
        author=current_user.full_name or current_user.username,
        author_id=current_user.id,
        content=new_reply.content,
        likes=0,
        created_at=new_reply.created_at
    )


@router.post("/discussions/{discussion_id}/like")
async def like_discussion(
    discussion_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Like/unlike a discussion."""
    # Check if already liked
    existing_like = db.query(DiscussionLike).filter(
        DiscussionLike.discussion_id == discussion_id,
        DiscussionLike.user_id == current_user.id
    ).first()
    
    discussion = db.query(Discussion).filter(Discussion.id == discussion_id).first()
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")
    
    if existing_like:
        # Unlike
        db.delete(existing_like)
        discussion.like_count = max(0, discussion.like_count - 1)
        action = "unliked"
    else:
        # Like
        new_like = DiscussionLike(
            discussion_id=discussion_id,
            user_id=current_user.id
        )
        db.add(new_like)
        discussion.like_count += 1
        action = "liked"
    
    db.commit()
    
    return {"status": "success", "action": action, "likes": discussion.like_count}


@router.post("/replies/{reply_id}/like")
async def like_reply(
    reply_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Like/unlike a reply."""
    # Check if already liked
    existing_like = db.query(ReplyLike).filter(
        ReplyLike.reply_id == reply_id,
        ReplyLike.user_id == current_user.id
    ).first()
    
    reply = db.query(DiscussionReply).filter(DiscussionReply.id == reply_id).first()
    if not reply:
        raise HTTPException(status_code=404, detail="Reply not found")
    
    if existing_like:
        # Unlike
        db.delete(existing_like)
        reply.like_count = max(0, reply.like_count - 1)
        action = "unliked"
    else:
        # Like
        new_like = ReplyLike(
            reply_id=reply_id,
            user_id=current_user.id
        )
        db.add(new_like)
        reply.like_count += 1
        action = "liked"
    
    db.commit()
    
    return {"status": "success", "action": action, "likes": reply.like_count}
