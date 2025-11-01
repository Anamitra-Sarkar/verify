"""
Environment validation and configuration for production deployment
"""
import os
import sys
from typing import Optional, Dict
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ConfigValidator:
    """Validate required environment variables for production"""
    
    # Required environment variables for production
    REQUIRED_VARS = {
        "production": [
            "TAVILY_API_KEY",
            "HUGGINGFACE_TOKEN",
            "DATABASE_URL",
        ],
        "optional": [
            "GEMINI_API_KEY",  # For AI cross-verification
            "REDIS_URL",  # For caching
            "WHATSAPP_PHONE_NUMBER_ID",  # For WhatsApp integration
            "WHATSAPP_ACCESS_TOKEN",  # For WhatsApp integration
        ]
    }
    
    @classmethod
    def validate(cls, environment: str = "development") -> Dict[str, bool]:
        """
        Validate environment configuration
        
        Args:
            environment: 'development' or 'production'
            
        Returns:
            Dict with validation results
        """
        results = {
            "valid": True,
            "missing_required": [],
            "missing_optional": [],
            "warnings": []
        }
        
        # Check required variables (only in production)
        if environment == "production":
            for var in cls.REQUIRED_VARS["production"]:
                value = os.getenv(var)
                if not value or value in ["", "your_api_key_here", "your_token_here"]:
                    results["missing_required"].append(var)
                    results["valid"] = False
        
        # Check optional variables (warn only)
        for var in cls.REQUIRED_VARS["optional"]:
            value = os.getenv(var)
            if not value or value in ["", "your_api_key_here", "your_token_here"]:
                results["missing_optional"].append(var)
                results["warnings"].append(f"{var} not configured - some features may be limited")
        
        return results
    
    @classmethod
    def print_report(cls, results: Dict) -> None:
        """Print validation report"""
        if results["valid"]:
            logger.info("✅ Environment configuration is valid")
        else:
            logger.error("❌ Environment configuration is invalid!")
            logger.error(f"   Missing required variables: {', '.join(results['missing_required'])}")
        
        if results["missing_optional"]:
            logger.warning("⚠️ Optional configuration missing:")
            for var in results["missing_optional"]:
                logger.warning(f"   - {var}")
        
        if results["warnings"]:
            for warning in results["warnings"]:
                logger.warning(f"   {warning}")
    
    @classmethod
    def validate_and_exit(cls, environment: str = "development") -> None:
        """Validate and exit if invalid (for production)"""
        results = cls.validate(environment)
        cls.print_report(results)
        
        if not results["valid"] and environment == "production":
            logger.error("Cannot start in production mode with missing required variables!")
            logger.error("Please set all required environment variables.")
            sys.exit(1)


def get_config() -> Dict:
    """Get application configuration"""
    environment = os.getenv("ENVIRONMENT", "development")
    
    config = {
        "environment": environment,
        "debug": environment == "development",
        
        # API Keys
        "tavily_api_key": os.getenv("TAVILY_API_KEY"),
        "huggingface_token": os.getenv("HUGGINGFACE_TOKEN"),
        "gemini_api_key": os.getenv("GEMINI_API_KEY"),
        
        # Database
        "database_url": os.getenv("DATABASE_URL"),
        "redis_url": os.getenv("REDIS_URL"),
        
        # WhatsApp
        "whatsapp_phone_number_id": os.getenv("WHATSAPP_PHONE_NUMBER_ID"),
        "whatsapp_access_token": os.getenv("WHATSAPP_ACCESS_TOKEN"),
        "whatsapp_verify_token": os.getenv("WHATSAPP_VERIFY_TOKEN", "verify_ai_webhook_token"),
        
        # Server
        "host": os.getenv("HOST", "0.0.0.0"),
        "port": int(os.getenv("PORT", "8080")),
        
        # CORS
        "cors_origins": os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(","),
        
        # Rate Limiting
        "rate_limit_per_minute": int(os.getenv("RATE_LIMIT_PER_MINUTE", "60")),
        
        # Logging
        "log_level": os.getenv("LOG_LEVEL", "INFO"),
    }
    
    return config


def validate_production_config():
    """Validate configuration for production deployment"""
    environment = os.getenv("ENVIRONMENT", "development")
    
    logger.info(f"🚀 Starting VeriFy AI in {environment.upper()} mode")
    logger.info("="*60)
    
    ConfigValidator.validate_and_exit(environment)
    
    logger.info("="*60)
    logger.info("")


if __name__ == "__main__":
    # Test validation
    validate_production_config()
    config = get_config()
    
    print("\nConfiguration:")
    for key, value in config.items():
        if "key" in key.lower() or "token" in key.lower() or "password" in key.lower():
            # Mask sensitive values
            if value:
                print(f"  {key}: {'*' * 8}")
            else:
                print(f"  {key}: <not set>")
        else:
            print(f"  {key}: {value}")
