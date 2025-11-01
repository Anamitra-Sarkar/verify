# Production Deployment Guide for VeriFy AI

## Overview

This guide covers deploying VeriFy AI to Google Cloud Platform (GCP) for production use. The application consists of:

1. **Frontend**: React/Vite application (deployed to Cloud Storage + Cloud CDN)
2. **Backend**: FastAPI AI server (deployed to Cloud Run)
3. **WhatsApp Integration**: Separate service (deployed to Cloud Run)
4. **Database**: PostgreSQL (Cloud SQL)
5. **Cache**: Redis (Cloud Memorystore)

## Prerequisites

### Required Tools

```bash
# Install Google Cloud SDK
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init

# Install Docker
# See: https://docs.docker.com/get-docker/

# Install Node.js 18+ and npm
# See: https://nodejs.org/
```

### GCP Account Setup

1. Create a GCP project: https://console.cloud.google.com/
2. Enable required APIs:
   ```bash
   gcloud services enable \
     cloudbuild.googleapis.com \
     run.googleapis.com \
     storage.googleapis.com \
     sql-component.googleapis.com \
     redis.googleapis.com \
     secretmanager.googleapis.com
   ```

3. Set up billing

## Configuration

### Environment Variables

Create a `.env.production` file:

```bash
# API Configuration
VITE_API_URL=https://verify-ai-backend-XXXXX-uc.a.run.app

# Backend Configuration
ENVIRONMENT=production
DATABASE_URL=postgresql://user:pass@/db?host=/cloudsql/PROJECT:REGION:INSTANCE
REDIS_URL=redis://REDIS_IP:6379

# AI API Keys (Store in Secret Manager)
TAVILY_API_KEY=tvly-xxxxx
HUGGINGFACE_TOKEN=hf_xxxxx
GEMINI_API_KEY=xxxxx

# WhatsApp Configuration
WHATSAPP_PHONE_NUMBER_ID=xxxxx
WHATSAPP_ACCESS_TOKEN=xxxxx
WHATSAPP_VERIFY_TOKEN=xxxxx

# Firebase (for authentication)
FIREBASE_API_KEY=xxxxx
FIREBASE_AUTH_DOMAIN=xxxxx
FIREBASE_PROJECT_ID=xxxxx
```

### Secret Manager Setup

Store sensitive data in GCP Secret Manager:

```bash
# Create secrets
echo -n "your_tavily_key" | gcloud secrets create tavily-api-key --data-file=-
echo -n "your_huggingface_token" | gcloud secrets create huggingface-token --data-file=-
echo -n "your_gemini_key" | gcloud secrets create gemini-api-key --data-file=-
echo -n "your_database_url" | gcloud secrets create database-url --data-file=-

# Grant access to Cloud Run service account
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format='value(projectNumber)')
gcloud secrets add-iam-policy-binding tavily-api-key \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## Deployment Steps

### Step 1: Deploy Database

```bash
# Create Cloud SQL PostgreSQL instance
gcloud sql instances create verify-ai-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --root-password=YOUR_SECURE_PASSWORD

# Create database
gcloud sql databases create verifyai --instance=verify-ai-db

# Create user
gcloud sql users create verifyai \
  --instance=verify-ai-db \
  --password=YOUR_SECURE_PASSWORD
```

### Step 2: Deploy Redis Cache

```bash
# Create Redis instance
gcloud redis instances create verify-ai-cache \
  --size=1 \
  --region=us-central1 \
  --redis-version=redis_7_0
```

### Step 3: Build and Deploy Backend

```bash
cd backend

# Build Docker image
gcloud builds submit --config cloudbuild.yaml

# Or manually deploy to Cloud Run
gcloud run deploy verify-ai-backend \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 4Gi \
  --cpu 2 \
  --timeout 300 \
  --concurrency 80 \
  --min-instances 1 \
  --max-instances 10 \
  --set-secrets="TAVILY_API_KEY=tavily-api-key:latest,GEMINI_API_KEY=gemini-api-key:latest,HUGGINGFACE_TOKEN=huggingface-token:latest"

# Get the backend URL
BACKEND_URL=$(gcloud run services describe verify-ai-backend --region us-central1 --format='value(status.url)')
echo "Backend URL: $BACKEND_URL"
```

### Step 4: Deploy WhatsApp Integration (Optional)

```bash
cd backend

# Deploy WhatsApp service
gcloud run deploy verify-ai-whatsapp \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --timeout 60 \
  --set-env-vars="VERIFY_AI_API_URL=$BACKEND_URL" \
  --set-secrets="WHATSAPP_PHONE_NUMBER_ID=whatsapp-phone-id:latest,WHATSAPP_ACCESS_TOKEN=whatsapp-token:latest"
```

### Step 5: Build and Deploy Frontend

```bash
cd ../

# Install dependencies
npm install

# Create production environment file
cat > .env.production << EOF
VITE_API_URL=$BACKEND_URL
EOF

# Build frontend
npm run build

# Create Cloud Storage bucket
gsutil mb gs://verify-ai-frontend

# Enable static website hosting
gsutil web set -m index.html -e index.html gs://verify-ai-frontend

# Upload built files
gsutil -m cp -r dist/* gs://verify-ai-frontend/

# Make files public
gsutil -m acl ch -r -u AllUsers:R gs://verify-ai-frontend/*

# Optional: Set up Cloud CDN
gcloud compute backend-buckets create verify-ai-frontend-backend \
  --gcs-bucket-name=verify-ai-frontend

# Get the URL
echo "Frontend URL: https://storage.googleapis.com/verify-ai-frontend/index.html"
```

### Step 6: Set Up Custom Domain (Optional)

```bash
# Map custom domain
gcloud run services update verify-ai-backend \
  --region us-central1 \
  --add-custom-domain your-domain.com

# For frontend, use Cloud Load Balancer
# See: https://cloud.google.com/load-balancing/docs/https
```

## Post-Deployment

### Database Migrations

```bash
# Run migrations
gcloud run services exec verify-ai-backend \
  --region us-central1 \
  -- alembic upgrade head
```

### Verify Deployment

1. Check backend health:
   ```bash
   curl $BACKEND_URL/api/v1/health
   ```

2. Check frontend:
   ```bash
   curl https://storage.googleapis.com/verify-ai-frontend/index.html
   ```

3. Test API endpoints:
   ```bash
   # Test text detection
   curl -X POST $BACKEND_URL/api/v1/check-text \
     -H "Content-Type: application/json" \
     -d '{"text": "Test message for verification"}'
   ```

## Monitoring and Logging

### Set Up Monitoring

```bash
# Enable Cloud Monitoring
gcloud services enable monitoring.googleapis.com

# View logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=verify-ai-backend" --limit 50

# Set up alerts
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="High Error Rate" \
  --condition-display-name="Error rate > 5%" \
  --condition-threshold-value=0.05
```

### Application Performance Monitoring

- Use Cloud Trace for request tracing
- Use Cloud Profiler for performance profiling
- Set up Error Reporting for exception tracking

## Security

### Best Practices

1. **Secrets Management**:
   - Never commit secrets to git
   - Use Secret Manager for all sensitive data
   - Rotate secrets regularly

2. **IAM and Access Control**:
   ```bash
   # Restrict Cloud Run access
   gcloud run services remove-iam-policy-binding verify-ai-backend \
     --region us-central1 \
     --member="allUsers" \
     --role="roles/run.invoker"
   
   # Add specific users/service accounts
   gcloud run services add-iam-policy-binding verify-ai-backend \
     --region us-central1 \
     --member="serviceAccount:frontend@PROJECT.iam.gserviceaccount.com" \
     --role="roles/run.invoker"
   ```

3. **Network Security**:
   - Use VPC connector for private resources
   - Enable Cloud Armor for DDoS protection
   - Set up SSL/TLS certificates

4. **API Security**:
   - Enable rate limiting
   - Use API Gateway for additional security
   - Implement request validation

### Firewall Rules

```bash
# Allow only HTTPS traffic
gcloud compute firewall-rules create allow-https \
  --allow tcp:443 \
  --source-ranges 0.0.0.0/0 \
  --target-tags https-server
```

## Scaling and Performance

### Auto-scaling Configuration

Backend auto-scaling is configured in `cloudbuild.yaml`:
- Min instances: 1 (keep warm)
- Max instances: 10
- CPU threshold: 65%
- Memory: 4Gi per instance

### Performance Optimization

1. **Enable CDN** for frontend:
   ```bash
   gsutil setmeta -h "Cache-Control:public, max-age=31536000" gs://verify-ai-frontend/*.js
   gsutil setmeta -h "Cache-Control:public, max-age=31536000" gs://verify-ai-frontend/*.css
   ```

2. **Database Connection Pooling**:
   - Use Cloud SQL Proxy
   - Configure max connections in application

3. **Caching Strategy**:
   - Cache frequently accessed data in Redis
   - Use CDN for static assets
   - Implement application-level caching

## Cost Optimization

### Current Estimates (USD/month)

- **Cloud Run** (Backend): $20-100 (based on traffic)
- **Cloud Storage** (Frontend): $1-5
- **Cloud SQL** (db-f1-micro): $7
- **Cloud Memorystore** (Redis 1GB): $35
- **Data Transfer**: $1-20
- **Total**: ~$64-167/month (low to medium traffic)

### Cost Reduction Tips

1. Use Cloud Run's free tier (2M requests/month)
2. Enable autoscaling to scale to zero when idle
3. Use Cloud Storage's free tier (5GB)
4. Optimize database queries to reduce Cloud SQL load
5. Use appropriate instance sizes
6. Set up budget alerts

## Backup and Disaster Recovery

### Database Backups

```bash
# Enable automated backups
gcloud sql instances patch verify-ai-db \
  --backup-start-time=03:00 \
  --retained-backups-count=7

# Manual backup
gcloud sql backups create --instance=verify-ai-db
```

### Disaster Recovery Plan

1. **Database**: Automated daily backups with 7-day retention
2. **Code**: Version controlled in GitHub
3. **Secrets**: Stored in Secret Manager
4. **RTO**: < 1 hour
5. **RPO**: < 24 hours

## Troubleshooting

### Common Issues

1. **Cold Start Latency**:
   - Solution: Set min-instances to 1
   - Use Cloud Run's keep-alive feature

2. **Memory Issues**:
   - Solution: Increase memory allocation
   - Optimize model loading

3. **Connection Timeout**:
   - Solution: Increase timeout in cloudbuild.yaml
   - Check network connectivity

4. **High Costs**:
   - Solution: Review usage in Cloud Console
   - Optimize queries and caching
   - Adjust auto-scaling parameters

### Debug Commands

```bash
# View real-time logs
gcloud run services logs tail verify-ai-backend --region us-central1

# Check service status
gcloud run services describe verify-ai-backend --region us-central1

# List revisions
gcloud run revisions list --service verify-ai-backend --region us-central1

# Rollback to previous revision
gcloud run services update-traffic verify-ai-backend \
  --region us-central1 \
  --to-revisions REVISION_NAME=100
```

## CI/CD Pipeline

### GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GCP

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v1
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ secrets.GCP_PROJECT_ID }}
      
      - name: Build and Deploy Backend
        run: |
          cd backend
          gcloud builds submit --config cloudbuild.yaml
      
      - name: Build and Deploy Frontend
        run: |
          npm install
          npm run build
          gsutil -m rsync -r -d dist gs://verify-ai-frontend
```

## Maintenance

### Regular Tasks

- **Weekly**: Review error logs and metrics
- **Monthly**: Review costs and optimize
- **Quarterly**: Update dependencies and security patches
- **Annually**: Disaster recovery test

### Update Deployment

```bash
# Update backend
cd backend
gcloud builds submit --config cloudbuild.yaml

# Update frontend
npm run build
gsutil -m rsync -r -d dist gs://verify-ai-frontend
```

## Support and Resources

- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
- [VeriFy AI GitHub Repository](https://github.com/your-repo/verify-ai)

## Contact

For deployment issues, create an issue on GitHub or contact the development team.
