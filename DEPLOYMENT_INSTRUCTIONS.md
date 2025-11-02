# VeriFy Deployment Guide

## Prerequisites
- Vercel account for frontend deployment
- Google Cloud Platform account with Cloud Run enabled
- API keys configured (see .env.example)

## Frontend Deployment (Vercel)

### Automatic Deployment
1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the configuration from `vercel.json`
3. Set the environment variable in Vercel dashboard:
   - `VITE_API_URL=https://verify-ai-backend-1997316706.asia-south1.run.app`

### Manual Deployment
```bash
npm install
npm run build
# Deploy the 'build' directory to Vercel
```

## Backend Deployment (Google Cloud Run)

### Using Cloud Build (Recommended)
```bash
cd backend
gcloud builds submit --config cloudbuild.yaml
```

### Using Docker Directly
```bash
cd backend
docker build -t verify-ai-backend .
docker tag verify-ai-backend gcr.io/YOUR-PROJECT-ID/verify-ai-backend
docker push gcr.io/YOUR-PROJECT-ID/verify-ai-backend
gcloud run deploy verify-ai-backend \
  --image gcr.io/YOUR-PROJECT-ID/verify-ai-backend \
  --region asia-south1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8000 \
  --memory 4Gi \
  --cpu 2
```

## Chrome Extension

### Installation
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `chrome-extension` directory

### Configuration
The extension is pre-configured to use the production backend at:
`https://verify-ai-backend-1997316706.asia-south1.run.app/api/v1`

You can change this in the extension's Options page if needed.

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=https://verify-ai-backend-1997316706.asia-south1.run.app
```

### Backend (backend/.env)
Key variables:
- `API_HOST=0.0.0.0`
- `API_PORT=8000`
- `ENVIRONMENT=production`
- `CORS_ORIGINS=https://verify-lime.vercel.app,http://localhost:5173`
- See `backend/.env.example` for full list

## Verification

### Check Frontend
1. Visit `https://verify-lime.vercel.app`
2. Open browser console
3. Should see no errors

### Check Backend
```bash
curl https://verify-ai-backend-1997316706.asia-south1.run.app/api/v1/health
```
Should return: `{"status": "healthy", ...}`

### Check Chrome Extension
1. Install the extension
2. Visit any webpage
3. Click the extension icon
4. Check connection status at bottom of popup

## Troubleshooting

### Frontend shows 404 errors
- Verify `VITE_API_URL` is set correctly in Vercel
- Check browser console for actual URL being called
- Ensure backend is deployed and running

### Backend not responding
- Check Cloud Run logs: `gcloud logging read`
- Verify the service is running: `gcloud run services list`
- Test health endpoint directly

### CORS errors
- Backend has `allow_origins=["*"]` configured
- Should not have CORS issues, but check browser console
- Verify request includes proper headers

## Support
For issues, check:
1. Backend logs in Google Cloud Console
2. Frontend console in browser developer tools
3. Chrome extension console (inspect the popup)
