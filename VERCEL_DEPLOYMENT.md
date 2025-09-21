# 🚀 Vercel Deployment Guide for Minnie's Farm Resort

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas**: Set up a cloud MongoDB database at [mongodb.com/atlas](https://mongodb.com/atlas)
3. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, or Bitbucket)

## 🔧 Pre-Deployment Setup

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Set up MongoDB Atlas
1. Create a new cluster on MongoDB Atlas
2. Create a database user with read/write permissions
3. Whitelist all IP addresses (0.0.0.0/0) for serverless functions
4. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/minnies_farm_resort`

## 🌐 Deployment Steps

### Step 1: Deploy to Vercel
```bash
# Navigate to your project directory
cd c:\Users\moral\Documents\resort\my-resort

# Deploy to Vercel
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - What's your project's name? minnies-farm-resort
# - In which directory is your code located? ./
```

### Step 2: Configure Environment Variables
After deployment, go to your Vercel dashboard and add these environment variables:

**Required Environment Variables:**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/minnies_farm_resort
JWT_SECRET=your-super-secure-jwt-secret-key-here
NODE_ENV=production
```

**Optional Environment Variables (for email functionality):**
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Step 3: Deploy Production Version
```bash
# Deploy to production
vercel --prod
```

## 🔐 Environment Variables Setup

### In Vercel Dashboard:
1. Go to your project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables"
4. Add each variable with the following settings:
   - **Name**: Variable name (e.g., `MONGODB_URI`)
   - **Value**: Variable value
   - **Environments**: Select "Production", "Preview", and "Development"

### Generate JWT Secret:
```bash
# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 📁 Project Structure for Vercel

Your project now has the following structure optimized for Vercel:

```
my-resort/
├── api/
│   └── index.js          # Serverless API handler
├── backend/
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   └── middleware/       # Custom middleware
├── src/                  # React frontend
├── public/               # Static assets
├── build/                # Built React app (generated)
├── vercel.json          # Vercel configuration
├── package.json         # Dependencies and scripts
└── .env.vercel.example  # Environment variables template
```

## 🔄 API Endpoints

After deployment, your API will be available at:
- **Base URL**: `https://your-app.vercel.app/api`
- **Health Check**: `https://your-app.vercel.app/api/health`

### Available Endpoints:
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/bookings` - Get bookings
- `POST /api/bookings` - Create booking
- `GET /api/contacts` - Get contacts
- `POST /api/contacts` - Submit contact form
- `GET /api/testimonials` - Get testimonials
- `POST /api/testimonials` - Add testimonial
- `GET /api/admin/*` - Admin endpoints
- `GET /api/users/*` - User management
- `POST /api/images/upload` - Image upload

## 🚀 Deployment Commands

### Development
```bash
# Run locally
npm run dev

# Test API locally
npm run start
```

### Production Deployment
```bash
# Build and deploy
npm run build
vercel --prod

# Or use the custom script
npm run deploy
```

## 🔍 Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**
   - Ensure your MongoDB Atlas cluster allows connections from all IPs (0.0.0.0/0)
   - Verify your connection string is correct
   - Check that your database user has proper permissions

2. **Environment Variables Not Working**
   - Make sure all environment variables are set in Vercel dashboard
   - Redeploy after adding new environment variables
   - Check variable names match exactly (case-sensitive)

3. **API Routes Not Working**
   - Verify `vercel.json` configuration is correct
   - Check that all backend dependencies are in main `package.json`
   - Ensure API routes are properly structured

4. **Build Failures**
   - Check that all dependencies are installed
   - Verify Node.js version compatibility
   - Review build logs in Vercel dashboard

### Debug Commands:
```bash
# Check deployment logs
vercel logs

# Test API endpoints
curl https://your-app.vercel.app/api/health

# Local development with Vercel
vercel dev
```

## 📊 Monitoring

### Vercel Dashboard Features:
- **Analytics**: Track page views and performance
- **Functions**: Monitor serverless function execution
- **Logs**: View real-time application logs
- **Deployments**: Track deployment history

### Health Monitoring:
- Health check endpoint: `/api/health`
- Monitor MongoDB connection status
- Track API response times

## 🔄 Continuous Deployment

### Automatic Deployments:
1. Connect your Git repository to Vercel
2. Enable automatic deployments from main branch
3. Set up preview deployments for pull requests

### Manual Deployments:
```bash
# Deploy current branch
vercel

# Deploy specific branch
vercel --prod --confirm
```

## 🎉 Post-Deployment

After successful deployment:

1. **Test all functionality**:
   - User registration/login
   - Booking system
   - Contact forms
   - Admin panel
   - Image uploads

2. **Configure custom domain** (optional):
   - Go to Vercel dashboard > Domains
   - Add your custom domain
   - Update DNS settings

3. **Set up monitoring**:
   - Enable Vercel Analytics
   - Set up error tracking
   - Monitor performance metrics

Your Minnie's Farm Resort is now live on Vercel! 🎊

## 📞 Support

If you encounter any issues:
1. Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
2. Review deployment logs in Vercel dashboard
3. Test API endpoints individually
4. Verify environment variables are set correctly

Happy deploying! 🚀
