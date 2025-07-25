# Deployment Guide

This guide covers different deployment options for the Mini Support Ticketing System.

## 🚀 Deployment Options

### 1. Local Development
```bash
# Backend
cd backend
pip install -r requirements.txt
python app.py

# Frontend
cd frontend
npm install
npm start
```

### 2. Docker Deployment

#### Backend Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "app.py"]
```

#### Frontend Dockerfile
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - DATABASE_URL=sqlite:///ticketing_system.db
    volumes:
      - ./data:/app/data

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      - REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Heroku Deployment

#### Backend (Heroku)
```bash
# Install Heroku CLI
# Create Heroku app
heroku create your-app-name-backend

# Add buildpack
heroku buildpacks:set heroku/python

# Create Procfile
echo "web: python app.py" > backend/Procfile

# Deploy
git subtree push --prefix=backend heroku main
```

#### Frontend (Netlify/Vercel)
```bash
# Build command: npm run build
# Publish directory: build
# Environment variables: REACT_APP_API_URL
```

### 4. AWS Deployment

#### Backend (AWS Elastic Beanstalk)
```bash
# Install EB CLI
pip install awsebcli

# Initialize EB
cd backend
eb init

# Create environment
eb create production

# Deploy
eb deploy
```

#### Frontend (AWS S3 + CloudFront)
```bash
# Build the app
npm run build

# Upload to S3
aws s3 sync build/ s3://your-bucket-name --delete

# Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### 5. Google Cloud Platform

#### Backend (Cloud Run)
```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/ticketing-backend

# Deploy to Cloud Run
gcloud run deploy --image gcr.io/PROJECT_ID/ticketing-backend --platform managed
```

#### Frontend (Firebase Hosting)
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize Firebase
firebase init hosting

# Build and deploy
npm run build
firebase deploy
```

### 6. DigitalOcean App Platform

#### app.yaml
```yaml
name: mini-support-ticketing
services:
- name: backend
  source_dir: /backend
  github:
    repo: okaditya84/mini-support-ticketing-system
    branch: main
  run_command: python app.py
  environment_slug: python
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: FLASK_ENV
    value: production

- name: frontend
  source_dir: /frontend
  github:
    repo: okaditya84/mini-support-ticketing-system
    branch: main
  build_command: npm run build
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
```

## 🔧 Production Configuration

### Environment Variables

#### Backend (.env)
```bash
FLASK_ENV=production
SECRET_KEY=your-super-secret-key-here
DATABASE_URL=postgresql://user:password@host:port/database
GROQ_API_KEY=your-groq-api-key
CORS_ORIGINS=https://your-frontend-domain.com
```

#### Frontend (.env.production)
```bash
REACT_APP_API_URL=https://your-backend-domain.com/api
GENERATE_SOURCEMAP=false
```

### Database Migration

For production, consider using PostgreSQL:

```python
# Update app.py
import os
from urllib.parse import urlparse

# Database configuration
database_url = os.getenv('DATABASE_URL', 'sqlite:///ticketing_system.db')

if database_url.startswith('postgres://'):
    database_url = database_url.replace('postgres://', 'postgresql://', 1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
```

### Security Considerations

1. **HTTPS**: Always use HTTPS in production
2. **Environment Variables**: Store secrets securely
3. **CORS**: Configure proper CORS origins
4. **Rate Limiting**: Implement API rate limiting
5. **Input Validation**: Validate all user inputs
6. **Authentication**: Consider JWT tokens for production

### Performance Optimization

1. **Frontend**:
   - Enable gzip compression
   - Use CDN for static assets
   - Implement lazy loading
   - Optimize bundle size

2. **Backend**:
   - Use connection pooling
   - Implement caching (Redis)
   - Add database indexing
   - Use async operations

### Monitoring and Logging

1. **Application Monitoring**:
   - Use services like New Relic, DataDog, or AWS CloudWatch
   - Monitor response times and error rates
   - Set up alerts for critical issues

2. **Logging**:
   - Implement structured logging
   - Use centralized log management
   - Monitor security events

### Backup Strategy

1. **Database Backups**:
   - Automated daily backups
   - Test restore procedures
   - Multiple backup locations

2. **File Backups**:
   - Version control for code
   - Asset backups if applicable

## 📊 Cost Estimation

### Free Tier Options
- **Heroku**: Free tier for backend
- **Netlify/Vercel**: Free tier for frontend
- **SQLite**: No additional database costs

### Paid Options
- **AWS**: ~$10-50/month depending on usage
- **Google Cloud**: ~$15-60/month
- **DigitalOcean**: ~$12-48/month

Choose the deployment option that best fits your needs, budget, and technical requirements!
