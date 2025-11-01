"""
WhatsApp Business API Integration for VeriFy AI
Allows users to access text and image classification through WhatsApp
Similar to Perplexity AI's WhatsApp integration
"""

import os
import asyncio
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel
from typing import Optional
import httpx
from dotenv import load_dotenv
import logging

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="VeriFy AI WhatsApp Integration")

# WhatsApp Business API Configuration
WHATSAPP_API_URL = "https://graph.facebook.com/v18.0"
WHATSAPP_PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID")
WHATSAPP_ACCESS_TOKEN = os.getenv("WHATSAPP_ACCESS_TOKEN")
WHATSAPP_VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN", "verify_ai_webhook_token")

# VeriFy AI Backend URL
VERIFY_AI_API_URL = os.getenv("VERIFY_AI_API_URL", "http://localhost:8001")


class WhatsAppMessage(BaseModel):
    from_number: str
    message_text: Optional[str] = None
    media_url: Optional[str] = None
    media_type: Optional[str] = None


async def send_whatsapp_message(to_number: str, message: str):
    """Send a text message via WhatsApp Business API"""
    if not WHATSAPP_PHONE_NUMBER_ID or not WHATSAPP_ACCESS_TOKEN:
        logger.error("WhatsApp credentials not configured")
        return False
    
    url = f"{WHATSAPP_API_URL}/{WHATSAPP_PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {WHATSAPP_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "messaging_product": "whatsapp",
        "to": to_number,
        "type": "text",
        "text": {"body": message}
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers, timeout=10.0)
            response.raise_for_status()
            logger.info(f"Message sent to {to_number}")
            return True
    except Exception as e:
        logger.error(f"Failed to send WhatsApp message: {str(e)}")
        return False


async def send_whatsapp_reaction(to_number: str, message_id: str, emoji: str):
    """Send a reaction to a WhatsApp message"""
    if not WHATSAPP_PHONE_NUMBER_ID or not WHATSAPP_ACCESS_TOKEN:
        return False
    
    url = f"{WHATSAPP_API_URL}/{WHATSAPP_PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {WHATSAPP_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "messaging_product": "whatsapp",
        "to": to_number,
        "type": "reaction",
        "reaction": {
            "message_id": message_id,
            "emoji": emoji
        }
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers, timeout=10.0)
            response.raise_for_status()
            return True
    except Exception as e:
        logger.error(f"Failed to send reaction: {str(e)}")
        return False


async def analyze_text_content(text: str) -> dict:
    """Analyze text using VeriFy AI backend"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{VERIFY_AI_API_URL}/api/v1/check-text",
                json={"text": text},
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        logger.error(f"Failed to analyze text: {str(e)}")
        return {"error": "Analysis failed"}


async def analyze_image_content(image_url: str) -> dict:
    """Download and analyze image using VeriFy AI backend"""
    try:
        # Download image
        async with httpx.AsyncClient() as client:
            image_response = await client.get(image_url, timeout=15.0)
            image_response.raise_for_status()
            image_data = image_response.content
            
            # Analyze image
            files = {"file": ("image.jpg", image_data, "image/jpeg")}
            analysis_response = await client.post(
                f"{VERIFY_AI_API_URL}/api/v1/check-image",
                files=files,
                timeout=30.0
            )
            analysis_response.raise_for_status()
            return analysis_response.json()
    except Exception as e:
        logger.error(f"Failed to analyze image: {str(e)}")
        return {"error": "Analysis failed"}


def format_analysis_result(result: dict) -> str:
    """Format analysis result for WhatsApp message"""
    if "error" in result:
        return "❌ Sorry, I couldn't analyze the content. Please try again."
    
    is_fake = result.get("is_fake", False)
    confidence = result.get("confidence", 0) * 100
    verdict = result.get("verdict", "UNKNOWN")
    
    # Create emoji-rich response
    if is_fake:
        icon = "🚫"
        status = "LIKELY FAKE"
    else:
        icon = "✅"
        status = "LIKELY AUTHENTIC"
    
    message = f"{icon} *VeriFy AI Analysis*\n\n"
    message += f"*Verdict:* {status}\n"
    message += f"*Confidence:* {confidence:.1f}%\n\n"
    
    analysis = result.get("analysis", "")
    if analysis and isinstance(analysis, str):
        # Simplify analysis for WhatsApp (remove technical details)
        simple_analysis = analysis.split('\n')[0][:200]
        message += f"{simple_analysis}\n\n"
    
    message += "💡 _This is an AI analysis. Always verify important information from official sources._"
    
    return message


async def process_whatsapp_message(wa_msg: WhatsAppMessage):
    """Process incoming WhatsApp message and send analysis"""
    try:
        # Send immediate reaction to acknowledge
        logger.info(f"Processing message from {wa_msg.from_number}")
        
        # Send "thinking" message
        await send_whatsapp_message(
            wa_msg.from_number,
            "🤖 Analyzing your content... Please wait."
        )
        
        # Process based on content type
        if wa_msg.media_url and wa_msg.media_type == "image":
            # Image analysis
            result = await analyze_image_content(wa_msg.media_url)
        elif wa_msg.message_text:
            # Text analysis
            if len(wa_msg.message_text) < 20:
                await send_whatsapp_message(
                    wa_msg.from_number,
                    "Please send a longer message (at least 20 characters) for analysis."
                )
                return
            result = await analyze_text_content(wa_msg.message_text)
        else:
            await send_whatsapp_message(
                wa_msg.from_number,
                "Please send either text or an image for analysis. Video and audio are not supported via WhatsApp."
            )
            return
        
        # Format and send result
        formatted_result = format_analysis_result(result)
        await send_whatsapp_message(wa_msg.from_number, formatted_result)
        
    except Exception as e:
        logger.error(f"Error processing WhatsApp message: {str(e)}")
        await send_whatsapp_message(
            wa_msg.from_number,
            "❌ An error occurred while processing your request. Please try again."
        )


@app.get("/webhook")
async def verify_webhook(request: Request):
    """Verify webhook for WhatsApp Business API"""
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")
    
    if mode == "subscribe" and token == WHATSAPP_VERIFY_TOKEN:
        logger.info("Webhook verified successfully")
        return PlainTextResponse(content=challenge)
    else:
        raise HTTPException(status_code=403, detail="Verification failed")


@app.post("/webhook")
async def receive_webhook(request: Request):
    """Receive webhook from WhatsApp Business API"""
    try:
        data = await request.json()
        logger.info(f"Received webhook: {data}")
        
        # Parse WhatsApp message
        if "entry" in data:
            for entry in data["entry"]:
                for change in entry.get("changes", []):
                    value = change.get("value", {})
                    
                    # Process messages
                    if "messages" in value:
                        for message in value["messages"]:
                            from_number = message.get("from")
                            message_type = message.get("type")
                            
                            wa_msg = WhatsAppMessage(from_number=from_number)
                            
                            if message_type == "text":
                                wa_msg.message_text = message.get("text", {}).get("body")
                            elif message_type == "image":
                                wa_msg.media_type = "image"
                                image_id = message.get("image", {}).get("id")
                                # Get image URL from WhatsApp API
                                # In production, you'd fetch the actual image URL here
                                wa_msg.media_url = f"{WHATSAPP_API_URL}/{image_id}"
                            
                            # Process message asynchronously
                            asyncio.create_task(process_whatsapp_message(wa_msg))
        
        return {"status": "ok"}
    
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        # Don't expose internal error details to external webhook
        return {"status": "error", "message": "Webhook processing failed"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    configured = bool(WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN)
    return {
        "status": "healthy",
        "whatsapp_configured": configured,
        "service": "VeriFy AI WhatsApp Integration"
    }


if __name__ == "__main__":
    import uvicorn
    
    if not WHATSAPP_PHONE_NUMBER_ID or not WHATSAPP_ACCESS_TOKEN:
        logger.warning("⚠️ WhatsApp credentials not configured!")
        logger.warning("Please set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN in .env")
    
    logger.info("🚀 Starting VeriFy AI WhatsApp Integration...")
    logger.info(f"📱 Webhook URL: http://your-domain.com/webhook")
    logger.info(f"🔑 Verify Token: {WHATSAPP_VERIFY_TOKEN}")
    
    uvicorn.run(app, host="0.0.0.0", port=8002)
