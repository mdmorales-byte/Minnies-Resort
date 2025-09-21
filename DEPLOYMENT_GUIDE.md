# 🚀 Production Deployment Guide

## 📋 Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Copy `.env.example` to `.env` and configure production values
- [ ] Set strong JWT_SECRET (use: `openssl rand -hex 64`)
- [ ] Configure production MongoDB URI
- [ ] Set NODE_ENV=production
- [ ] Configure email settings for notifications

### 2. Database Setup
```bash
# For MongoDB Atlas (Cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/minnies_farm_resort

# For local MongoDB (Production)
MONGODB_URI=mongodb://localhost:27017/minnies_farm_resort_prod
```

### 3. Security Configuration
```bash
# Generate secure JWT secret
openssl rand -hex 64

# Update CORS origins for production
FRONTEND_URL=https://your-domain.com
```

## 🌐 Deployment Options

### Option 1: Traditional VPS/Server
```bash
# 1. Install Node.js and MongoDB
sudo apt update
sudo apt install nodejs npm mongodb

# 2. Clone and setup project
git clone your-repo
cd my-resort
npm install
cd backend && npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with production values

# 4. Start with PM2
npm install -g pm2
pm2 start backend/server.js --name "resort-api"
pm2 start "npm start" --name "resort-frontend"
pm2 startup
pm2 save
```

### Option 2: Docker Deployment
```dockerfile
# Create Dockerfile in root
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000 5000
CMD ["npm", "run", "prod"]
```

### Option 3: Cloud Platforms

#### Heroku
```bash
# Install Heroku CLI
heroku create minnie-farm-resort
heroku addons:create mongolab:sandbox
heroku config:set NODE_ENV=production
git push heroku main
```

#### Vercel (Frontend) + Railway (Backend)
```bash
# Frontend on Vercel
vercel --prod

# Backend on Railway
# Connect GitHub repo to Railway
# Set environment variables in Railway dashboard
```

## 🔧 Production Configuration

### Backend (server.js)
```javascript
// Update CORS for production
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));
```

### Frontend (package.json)
```json
{
  "homepage": "https://your-domain.com",
  "scripts": {
    "build": "react-scripts build",
    "deploy": "npm run build && serve -s build"
  }
}
```

## 🔒 Security Hardening

### 1. Environment Variables
```bash
# Never commit these to Git
JWT_SECRET=your-super-secure-secret-key
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
EMAIL_PASS=your-app-specific-password
```

### 2. Rate Limiting (Production)
```javascript
// Stricter rate limiting for production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
```

### 3. HTTPS Setup
```bash
# Using Let's Encrypt with Nginx
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 📊 Monitoring & Maintenance

### 1. Logging
```javascript
// Add production logging
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 2. Database Backups
```bash
# Automated MongoDB backups
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGODB_URI" --out="/backups/backup_$DATE"
```

### 3. Health Monitoring
```bash
# Setup monitoring endpoints
GET /api/health
GET /api/status
```

## 🚀 Go-Live Steps

1. **Test in staging environment**
2. **Run security audit**: `npm audit`
3. **Optimize build**: `npm run build`
4. **Configure domain and SSL**
5. **Setup monitoring and backups**
6. **Deploy and test all features**
7. **Monitor logs for first 24 hours**

## 📱 Post-Deployment

### Customer Features
- ✅ Online booking system
- ✅ Contact form submissions
- ✅ Real-time availability
- ✅ Email confirmations

### Admin Features
- ✅ Secure admin panel
- ✅ Booking management
- ✅ Customer communications
- ✅ User management
- ✅ Analytics dashboard

### Technical Features
- ✅ Database persistence
- ✅ JWT authentication
- ✅ API rate limiting
- ✅ Error handling
- ✅ Security headers

## 🆘 Emergency Procedures

### Rollback Plan
```bash
# Quick rollback to previous version
pm2 stop all
git checkout previous-stable-tag
npm install
pm2 start all
```

### Database Recovery
```bash
# Restore from backup
mongorestore --uri="$MONGODB_URI" /path/to/backup
```

Your resort system is now production-ready! 🎉
