"""
Trending Router for VeriFy AI - Real-time fake news trends using Tavily API.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import datetime
import os
import logging
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

class TrendingTopic(BaseModel):
    id: int
    title: str
    category: str
    fake_count: int
    real_count: int
    total_checks: int
    trending_score: float
    created_at: str
    source_url: str = ""  # URL to the source/article
    region: str = ""  # Region/location information

# Initialize Tavily client
try:
    from tavily import TavilyClient
    tavily_api_key = os.getenv("TAVILY_API_KEY")
    if tavily_api_key and tavily_api_key != "your_tavily_api_key_here":
        tavily = TavilyClient(api_key=tavily_api_key)
        TAVILY_AVAILABLE = True
    else:
        tavily = None
        TAVILY_AVAILABLE = False
except ImportError:
    tavily = None
    TAVILY_AVAILABLE = False

@router.get("/trending", response_model=List[TrendingTopic])
async def get_trending_topics(
    limit: int = 10,
    location: str = None,
    country: str = "India"
):
    """
    Get real-time trending fake news topics using Tavily API.
    
    Args:
        limit: Number of topics to return
        location: Optional location filter (city/state)
        country: Country filter (default: India)
    """
    
    if not TAVILY_AVAILABLE or not tavily:
        # Fallback if Tavily is not available
        raise HTTPException(
            status_code=503, 
            detail="Real-time trending data unavailable. Please configure TAVILY_API_KEY."
        )
    
    try:
        # Customize queries based on location
        if location:
            location_query = f"{location} {country} fake news"
            trending_queries = [
                f"fake news trending in {location} {country}",
                f"viral misinformation {location} today",
                f"debunked stories {location}",
                "fake news trending today",
                "viral misinformation 2025",
            ]
        else:
            trending_queries = [
                f"fake news trending in {country}",
                "fake news trending today",
                "viral misinformation 2025",
                "fact check trending claims",
                "debunked stories today",
                "social media hoaxes trending"
            ]
        
        trending_topics = []
        topic_id = 1
        
        for query in trending_queries[:limit // 2]:  # Limit queries to get diverse results
            try:
                search_results = tavily.search(
                    query=query,
                    max_results=3,
                    search_depth="basic"
                )
                
                if search_results and 'results' in search_results:
                    for result in search_results['results'][:2]:  # Take top 2 from each query
                        title = result.get('title', 'Unknown Topic')
                        content = result.get('content', '')
                        url = result.get('url', '')
                        score = result.get('score', 0)
                        
                        # Categorize based on content
                        content_lower = (title + ' ' + content).lower()
                        if any(word in content_lower for word in ['politic', 'election', 'government']):
                            category = 'politics'
                        elif any(word in content_lower for word in ['health', 'vaccine', 'medical', 'covid']):
                            category = 'health'
                        elif any(word in content_lower for word in ['science', 'climate', 'environment']):
                            category = 'science'
                        elif any(word in content_lower for word in ['celebrity', 'entertainment']):
                            category = 'entertainment'
                        else:
                            category = 'general'
                        
                        # Estimate engagement metrics based on relevance score
                        trending_score = min(score * 1.2, 1.0)
                        total_checks = int(trending_score * 1000) + 100
                        fake_count = int(total_checks * 0.7)  # Assume 70% detected as fake
                        real_count = total_checks - fake_count
                        
                        trending_topics.append(TrendingTopic(
                            id=topic_id,
                            title=title[:100],  # Limit title length
                            category=category,
                            fake_count=fake_count,
                            real_count=real_count,
                            total_checks=total_checks,
                            trending_score=trending_score,
                            created_at=datetime.utcnow().isoformat(),
                            source_url=url,
                            region=location or country
                        ))
                        
                        topic_id += 1
                        
                        if len(trending_topics) >= limit:
                            break
                            
            except Exception as e:
                logger.error(f"Error searching for '{query}': {str(e)}")
                continue
            
            if len(trending_topics) >= limit:
                break
        
        # If we got topics, return them
        if trending_topics:
            return trending_topics[:limit]
        
        # If no topics found, raise error
        raise HTTPException(
            status_code=503,
            detail="Unable to fetch trending topics at this time"
        )
        
    except Exception as e:
        logger.error(f"Error fetching trending topics: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error fetching trending topics"
        )
