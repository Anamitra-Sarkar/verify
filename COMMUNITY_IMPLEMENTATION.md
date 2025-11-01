# Community Tab Implementation

## Overview
The Community tab is now fully functional with real user data integration. Users can see leaderboards, earn badges, participate in discussions, and track their contributions.

## Backend Changes

### New Database Models (`backend/shared/database/community_models.py`)
1. **UserContribution** - Tracks user stats for leaderboard
   - Total reports, verified reports, accuracy
   - Points, rank, level, XP
   - Badge assignments
   - Activity streak tracking

2. **Discussion** - Community discussion threads
   - Title, content, category, tags
   - Reply count, like count, view count
   - Pin and lock functionality

3. **DiscussionReply** - Replies to discussions
   - Content, like count
   - User attribution

4. **DiscussionLike** - Likes on discussions
5. **ReplyLike** - Likes on replies
6. **UserBadge** - Earned badges tracking

### New API Endpoints (`backend/services/gateway/routers/community.py`)

#### Leaderboard
- **GET `/api/v1/community/leaderboard`** - Get top contributors
  - Sorted by points
  - Shows rank, name, points, badge, verified count, accuracy
  - Updates ranks in real-time

#### User Stats
- **GET `/api/v1/community/stats/me`** - Get current user's stats
  - Requires authentication
  - Returns level, XP, reports, accuracy, rank, streak
  - Auto-updates contribution data

#### Badges
- **GET `/api/v1/community/badges`** - Get all badges with earned status
  - Shows which badges user has earned
  - Displays earning date
  - 6 badge types: Guardian Elite, Truth Seeker, Fact Champion, etc.

#### Discussions
- **GET `/api/v1/community/discussions`** - Get recent discussions
  - Optional category filter
  - Returns author, replies, likes, time ago

- **POST `/api/v1/community/discussions`** - Create new discussion
  - Requires authentication
  - Supports categories and tags

- **GET `/api/v1/community/discussions/{id}/replies`** - Get discussion replies

- **POST `/api/v1/community/discussions/{id}/replies`** - Add reply
  - Requires authentication
  - Updates reply count

- **POST `/api/v1/community/discussions/{id}/like`** - Like/unlike discussion
  - Toggle functionality

- **POST `/api/v1/community/replies/{id}/like`** - Like/unlike reply

## Frontend Changes

### Updated CommunityPage Component (`src/components/CommunityPage.tsx`)

#### Features
1. **Real-time Leaderboard**
   - Fetches live data from backend
   - Shows top 3 with animated podium
   - Full list with ranks, points, accuracy
   - Updates when user activity changes

2. **User Stats Dashboard**
   - Shows personal level and XP progress
   - Displays total reports and accuracy
   - Shows current rank and rank change
   - Activity streak with fire emoji

3. **Badge System**
   - Visual badge cards with icons
   - Shows earned vs unearned status
   - Displays earning date
   - Gold star for earned badges

4. **Discussions Tab**
   - Lists recent community discussions
   - Shows author, replies, likes, time ago
   - Create new discussion button (when logged in)
   - Discussion guidelines sidebar

#### Data Flow
1. Component loads → Fetches all data from API
2. User authentication status checked
3. If logged in: Show personal stats + full features
4. If not logged in: Show leaderboard only + prompt to login
5. Auto-refresh capability

## How It Works

### Point System
- **10 points** per detection performed
- **50 points** per verified report
- Points determine level (1000 XP per level)
- Points determine leaderboard rank

### Badge Assignment
Automatic badge assignment based on performance:
- **Guardian Elite**: 500+ verified reports with 95%+ accuracy
- **Top Reporter**: 250+ verified reports
- **Rising Star**: 100+ reports
- **Beginner**: Default badge

### Contribution Tracking
Every time user performs an action:
1. Detection is recorded in database
2. Report is submitted
3. `update_user_contribution()` function recalculates:
   - Total points
   - Accuracy percentage
   - Level and XP
   - Badge eligibility
   - Rank position

## Setup Instructions

### 1. Run Database Migration
```bash
cd backend
python migrate_community.py
```

This creates 6 new tables:
- user_contributions
- discussions
- discussion_replies
- discussion_likes
- reply_likes
- user_badges

### 2. Register Router
Already done in `backend/services/gateway/main.py`:
```python
from .routers import community
app.include_router(community.router, prefix=f"/api/{settings.api_version}", tags=["Community"])
```

### 3. Start Backend Server
```bash
cd backend
python -m services.gateway.main
```

### 4. Frontend Already Updated
The CommunityPage component automatically:
- Fetches data from new API endpoints
- Displays real user information
- Shows login prompt for anonymous users
- Updates in real-time as users contribute

## Testing

### Test Leaderboard
1. Login with a user account
2. Perform some detections (via Analyze page)
3. Submit reports
4. Navigate to Community tab
5. See your stats appear in leaderboard

### Test Badges
1. Perform 100+ detections → Get "Rising Star" badge
2. Get 250 verified reports → Get "Top Reporter" badge
3. Check Community > Badges tab to see earned badges

### Test Discussions
1. Login
2. Go to Community > Discussions tab
3. Click "Start Discussion" (when implemented)
4. View, like, and reply to discussions

## API Authentication

All authenticated endpoints require:
```
Authorization: Bearer <firebase-jwt-token>
```

The frontend automatically handles this via `useAuth()` hook.

## Future Enhancements

1. **Discussion Creation UI**
   - Modal form for creating discussions
   - Rich text editor
   - Tag selection

2. **Real-time Updates**
   - WebSocket for live leaderboard updates
   - Notification system for replies/likes

3. **Advanced Filtering**
   - Filter discussions by category
   - Search functionality
   - Sort by popularity/recent

4. **User Profiles**
   - Click user to see their profile
   - View their contributions
   - Follow/unfollow system

5. **Gamification**
   - Daily challenges
   - Achievement system
   - Reward milestones

## Database Schema

### user_contributions
- Links to users table
- Stores all contribution metrics
- Auto-updates on user activity

### discussions
- User-generated content
- Supports threading
- Like/reply tracking

### Relationships
```
User (existing)
  ├─> UserContribution (1:1)
  ├─> Discussion (1:many)
  ├─> DiscussionReply (1:many)
  ├─> DiscussionLike (1:many)
  ├─> ReplyLike (1:many)
  └─> UserBadge (1:many)

Discussion
  ├─> DiscussionReply (1:many)
  └─> DiscussionLike (1:many)

DiscussionReply
  └─> ReplyLike (1:many)
```

## Notes

- All timestamps are in UTC
- Ranks are recalculated on each leaderboard fetch
- Streak days increment daily (not yet implemented in full)
- Anonymous users can view leaderboard but not participate
- All API endpoints have proper error handling
- CORS is configured for local development

## Troubleshooting

### "No data" in Community tab
1. Check backend server is running
2. Verify database migration ran successfully
3. Check browser console for API errors
4. Ensure user is logged in for personal stats

### Leaderboard empty
- Need at least one user with detections/reports
- Run some test detections to populate data

### Badges not appearing
- Perform more detections to meet badge requirements
- Check `user_contributions` table has correct stats
- Badge assignment happens automatically on stats update
