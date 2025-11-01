"""
Database migration script to create community tables.
Run this to add community features to existing database.
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from shared.config import settings
from shared.database.models import Base
from shared.database.community_models import (
    UserContribution, Discussion, DiscussionReply,
    DiscussionLike, ReplyLike, UserBadge
)

def run_migration():
    """Create community tables in the database."""
    print("Creating database engine...")
    engine = create_engine(settings.database_url, echo=True)
    
    print("\nCreating community tables...")
    Base.metadata.create_all(bind=engine, tables=[
        UserContribution.__table__,
        Discussion.__table__,
        DiscussionReply.__table__,
        DiscussionLike.__table__,
        ReplyLike.__table__,
        UserBadge.__table__,
    ])
    
    print("\n✅ Community tables created successfully!")
    print("\nNew tables:")
    print("  - user_contributions")
    print("  - discussions")
    print("  - discussion_replies")
    print("  - discussion_likes")
    print("  - reply_likes")
    print("  - user_badges")

if __name__ == "__main__":
    try:
        run_migration()
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        sys.exit(1)
