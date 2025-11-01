"""
Community-related database models for VeriFy AI platform.
"""
from datetime import datetime
from sqlalchemy import (
    Boolean, Column, DateTime, ForeignKey, Integer, String, Text, Index
)
from sqlalchemy.orm import relationship
from .models import Base


class UserContribution(Base):
    """Track user contributions for leaderboard."""
    __tablename__ = "user_contributions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Contribution stats
    total_reports = Column(Integer, default=0, nullable=False)
    verified_reports = Column(Integer, default=0, nullable=False)
    accuracy_percentage = Column(Integer, default=0, nullable=False)
    
    # Points and ranking
    total_points = Column(Integer, default=0, nullable=False)
    current_rank = Column(Integer, nullable=True, index=True)
    
    # Badges
    badge_name = Column(String(100), nullable=True)
    badges_earned = Column(String(1000), nullable=True)  # Comma-separated badge names
    
    # Activity tracking
    streak_days = Column(Integer, default=0, nullable=False)
    last_activity = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Level system
    level = Column(Integer, default=1, nullable=False)
    xp_current = Column(Integer, default=0, nullable=False)
    xp_required = Column(Integer, default=1000, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    __table_args__ = (
        Index("idx_user_contrib_rank", "current_rank"),
        Index("idx_user_contrib_points", "total_points"),
        Index("idx_user_contrib_user", "user_id"),
    )


class Discussion(Base):
    """Community discussion threads."""
    __tablename__ = "discussions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Discussion content
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=True)
    category = Column(String(100), nullable=True, index=True)
    tags = Column(String(500), nullable=True)  # Comma-separated tags
    
    # Engagement metrics
    reply_count = Column(Integer, default=0, nullable=False)
    like_count = Column(Integer, default=0, nullable=False)
    view_count = Column(Integer, default=0, nullable=False)
    
    # Status
    is_pinned = Column(Boolean, default=False, nullable=False)
    is_locked = Column(Boolean, default=False, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    replies = relationship("DiscussionReply", back_populates="discussion", cascade="all, delete-orphan")
    likes = relationship("DiscussionLike", back_populates="discussion", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index("idx_discussion_created", "created_at"),
        Index("idx_discussion_category", "category"),
    )


class DiscussionReply(Base):
    """Replies to discussion threads."""
    __tablename__ = "discussion_replies"

    id = Column(Integer, primary_key=True, index=True)
    discussion_id = Column(Integer, ForeignKey("discussions.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    content = Column(Text, nullable=False)
    like_count = Column(Integer, default=0, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    discussion = relationship("Discussion", back_populates="replies")
    likes = relationship("ReplyLike", back_populates="reply", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index("idx_reply_discussion", "discussion_id"),
    )


class DiscussionLike(Base):
    """Likes on discussions."""
    __tablename__ = "discussion_likes"

    id = Column(Integer, primary_key=True, index=True)
    discussion_id = Column(Integer, ForeignKey("discussions.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    discussion = relationship("Discussion", back_populates="likes")
    
    __table_args__ = (
        Index("idx_discussion_like_unique", "discussion_id", "user_id", unique=True),
    )


class ReplyLike(Base):
    """Likes on discussion replies."""
    __tablename__ = "reply_likes"

    id = Column(Integer, primary_key=True, index=True)
    reply_id = Column(Integer, ForeignKey("discussion_replies.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    reply = relationship("DiscussionReply", back_populates="likes")
    
    __table_args__ = (
        Index("idx_reply_like_unique", "reply_id", "user_id", unique=True),
    )


class UserBadge(Base):
    """Badges earned by users."""
    __tablename__ = "user_badges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    badge_name = Column(String(100), nullable=False)
    badge_rarity = Column(String(50), nullable=False)  # Legendary, Epic, Rare, Uncommon, Common
    
    earned_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    __table_args__ = (
        Index("idx_user_badge_unique", "user_id", "badge_name", unique=True),
    )
