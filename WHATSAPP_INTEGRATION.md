# WhatsApp Integration for VeriFy AI

## Overview

VeriFy AI now supports WhatsApp integration, allowing users to access fake news and deepfake detection directly through WhatsApp - similar to Perplexity AI's approach.

## Features

- ✅ **Text Analysis**: Send text messages to check for misinformation
- ✅ **Image Analysis**: Send images to detect deepfakes and manipulated content
- ⚠️ **Video and Audio**: Not supported via WhatsApp (use web app for these features)
- 🚀 **Quick Responses**: Get AI-powered analysis in seconds
- 🔒 **Private**: All analyses are processed securely

## How It Works

1. User sends a WhatsApp message with text or image to VeriFy AI's WhatsApp number
2. VeriFy AI acknowledges receipt with a "processing" message
3. Content is analyzed using the same AI models as the web application
4. Results are sent back to the user in a formatted WhatsApp message

## Setup Instructions

### Prerequisites

1. **WhatsApp Business Account**
   - Sign up for WhatsApp Business API at [https://business.whatsapp.com](https://business.whatsapp.com)
   - Or use a provider like Twilio, MessageBird, or 360Dialog

2. **Facebook Developer Account**
   - Create an app at [https://developers.facebook.com](https://developers.facebook.com)
   - Enable WhatsApp Business API

### Step 1: Get WhatsApp Credentials

1. **Create a WhatsApp Business App**:
   - Go to [https://developers.facebook.com](https://developers.facebook.com)
   - Create a new app or select an existing one
   - Add "WhatsApp" product to your app

2. **Get Your Credentials**:
   - **Phone Number ID**: From WhatsApp > API Setup
   - **Access Token**: Generate a permanent access token
   - **Verify Token**: Create a custom string for webhook verification

### Step 2: Configure Environment Variables

Add these to your `.env` file:

```bash
# WhatsApp Business API Configuration
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_ACCESS_TOKEN=your_access_token_here
WHATSAPP_VERIFY_TOKEN=verify_ai_webhook_token

# VeriFy AI Backend URL (should be the main AI server)
VERIFY_AI_API_URL=http://localhost:8001
```

### Step 3: Start the WhatsApp Integration Server

```bash
cd backend
python whatsapp_integration.py
```

The server will run on port 8002 by default.

### Step 4: Configure Webhook

1. **Make Your Server Public**:
   - Use ngrok for testing:
     ```bash
     ngrok http 8002
     ```
   - Or deploy to a public server (recommended for production)

2. **Set Webhook URL in Facebook**:
   - Go to WhatsApp > Configuration
   - Set Callback URL to: `https://your-domain.com/webhook`
   - Set Verify Token to match your `WHATSAPP_VERIFY_TOKEN`
   - Subscribe to message events

3. **Verify Webhook**:
   - Facebook will send a verification request
   - Your server should respond with the challenge token

### Step 5: Test the Integration

1. Send a test message to your WhatsApp Business number:
   ```
   Hello, can you check if this is fake news?
   ```

2. You should receive:
   - Acknowledgment: "🤖 Analyzing your content... Please wait."
   - Analysis result with verdict and confidence

## Usage Examples

### Text Analysis
```
User: "Vaccines cause autism"
VeriFy AI: 
🚫 *VeriFy AI Analysis*

*Verdict:* LIKELY FAKE
*Confidence:* 95.0%

This claim has been thoroughly debunked by scientific research.

💡 This is an AI analysis. Always verify important information from official sources.
```

### Image Analysis
```
User: [Sends an image]
VeriFy AI:
✅ *VeriFy AI Analysis*

*Verdict:* LIKELY AUTHENTIC
*Confidence:* 87.3%

Image appears authentic with no signs of manipulation.

💡 This is an AI analysis. Always verify important information from official sources.
```

### Unsupported Content
```
User: [Sends a video]
VeriFy AI: "Please send either text or an image for analysis. Video and audio are not supported via WhatsApp."
```

## API Endpoints

### GET /webhook
Webhook verification endpoint for WhatsApp Business API.

**Query Parameters:**
- `hub.mode`: Should be "subscribe"
- `hub.verify_token`: Should match your WHATSAPP_VERIFY_TOKEN
- `hub.challenge`: Challenge string to echo back

**Response:**
Returns the challenge string if verification is successful.

### POST /webhook
Receives messages from WhatsApp.

**Request Body:**
WhatsApp webhook payload (JSON)

**Response:**
```json
{
  "status": "ok"
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "whatsapp_configured": true,
  "service": "VeriFy AI WhatsApp Integration"
}
```

## Architecture

```
User's WhatsApp → WhatsApp Business API → VeriFy AI Webhook → Analysis Server → Response
                                                ↓
                                        Text/Image Analysis
                                                ↓
                                          Result Formatting
                                                ↓
                                        WhatsApp Message
```

## Limitations

1. **Text Only**: Only text and image analysis supported (no video/audio)
2. **Rate Limits**: WhatsApp API has rate limits on messages
3. **File Size**: Images must be under 5MB
4. **Response Time**: Analysis may take 5-30 seconds depending on content

## Costs

- **WhatsApp Business API**: 
  - Conversations are billed by Meta
  - First 1,000 conversations/month are free
  - See [WhatsApp Pricing](https://developers.facebook.com/docs/whatsapp/pricing) for details

## Production Deployment

### Requirements

1. **HTTPS**: WhatsApp requires HTTPS for webhooks
2. **Static IP**: Recommended for webhook reliability
3. **Domain**: Use a proper domain (not localhost or ngrok)

### Recommended Setup

1. Deploy on Google Cloud Run, AWS Lambda, or similar
2. Use environment secrets management
3. Enable logging and monitoring
4. Set up error alerting

### Google Cloud Deployment

```bash
# Build container
gcloud builds submit --tag gcr.io/YOUR_PROJECT/whatsapp-verify

# Deploy to Cloud Run
gcloud run deploy whatsapp-verify \
  --image gcr.io/YOUR_PROJECT/whatsapp-verify \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars WHATSAPP_PHONE_NUMBER_ID=$PHONE_ID,WHATSAPP_ACCESS_TOKEN=$TOKEN
```

## Troubleshooting

### Webhook Not Receiving Messages

1. Check webhook URL is publicly accessible
2. Verify HTTPS is enabled
3. Check webhook subscription in Facebook dashboard
4. Review server logs for errors

### Analysis Not Working

1. Verify VeriFy AI backend is running
2. Check VERIFY_AI_API_URL is correct
3. Ensure models are loaded in backend
4. Review backend logs for errors

### Messages Not Sending

1. Check WHATSAPP_ACCESS_TOKEN is valid
2. Verify WHATSAPP_PHONE_NUMBER_ID is correct
3. Check WhatsApp Business API rate limits
4. Review Meta Business Suite for issues

## Support

For issues with:
- **WhatsApp API**: Contact Meta support or your provider
- **VeriFy AI**: Open an issue on GitHub
- **Integration**: Check logs and review this documentation

## Security Considerations

1. **Token Security**: Never commit tokens to version control
2. **Webhook Verification**: Always verify incoming webhooks
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **Data Privacy**: Don't store user messages unless required
5. **HTTPS Only**: Use HTTPS for all production deployments

## Future Enhancements

- [ ] Video analysis support (when WhatsApp API supports larger videos)
- [ ] Audio analysis support
- [ ] Multi-language support
- [ ] User preferences and settings
- [ ] Analytics dashboard
- [ ] Conversation history
- [ ] Premium features

## References

- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
- [Webhook Setup Guide](https://developers.facebook.com/docs/whatsapp/webhooks)
- [Message Templates](https://developers.facebook.com/docs/whatsapp/message-templates)
- [VeriFy AI Main Documentation](../README.md)
