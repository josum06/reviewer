# Deployment Guide: Vercel (Frontend) + Render (Backend)

## Prerequisites
- GitHub account with your repository pushed
- MongoDB Atlas account with a cluster
- API keys for: Groq, Google, Tavily

---

## Step 1: Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Get your connection string:
   - Click "Connect" → "Drivers"
   - Copy the connection string: `mongodb+srv://username:password@cluster.mongodb.net/bpit_pulse`
4. Keep this safe - you'll need it for both frontend and backend

---

## Step 2: Deploy Backend on Render

### 2.1 Prepare Your Repository
```bash
# Ensure you have a Procfile in backend-scrappers/
# It should contain: web: python server.py
```

### 2.2 Create Render Service
1. Go to [Render.com](https://render.com)
2. Sign up with GitHub (authorize access to your repo)
3. Click "New +" → "Web Service"
4. Select your repository
5. Fill in deployment settings:
   - **Name**: `college-sentiment-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python server.py`
   - **Instance Type**: Free

### 2.3 Add Environment Variables
In Render dashboard, go to "Environment":
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/bpit_pulse
GROQ_API_KEY=your_groq_key
GOOGLE_API_KEY=your_google_key
TAVILY_API_KEY=your_tavily_key
```

### 2.4 Deploy
- Click "Create Web Service"
- Wait for deployment to complete
- Copy your backend URL: `https://college-sentiment-backend.onrender.com`
- Note: First request may take 50s (free tier spins down after inactivity)

---

## Step 3: Deploy Frontend on Vercel

### 3.1 Prepare Your Repository
Ensure `.env.example` exists in the `frontend/` directory

### 3.2 Create Vercel Project
1. Go to [Vercel.com](https://vercel.com)
2. Sign up with GitHub (authorize access to your repo)
3. Click "Add New..." → "Project"
4. Import your repository
5. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend/`
   - Click "Continue"

### 3.3 Add Environment Variables
Before deploying, add these variables in Vercel:
```
NEXT_PUBLIC_API_URL=https://college-sentiment-backend.onrender.com
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
NEXTAUTH_URL=https://your-frontend-domain.vercel.app
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bpit_pulse
```

**Generate NEXTAUTH_SECRET** (run on your local machine):
```bash
openssl rand -base64 32
```
Copy the output and paste into Vercel environment variables.

### 3.4 Deploy
- Click "Deploy"
- Vercel automatically detects `package.json` in frontend/
- Wait for build to complete
- Your app will be live at: `https://your-project-name.vercel.app`

---

## Step 4: Verify Deployment

### Test Backend API
```bash
curl https://college-sentiment-backend.onrender.com/api/sentiment
```
Should return JSON data or empty array (if no data yet)

### Test Frontend
- Visit your Vercel URL
- Try signing up and logging in
- Check that API calls are reaching the backend

---

## Step 5: Common Issues & Solutions

### Issue: Backend times out on Render
**Solution**: Render free tier spins down after 15 mins. Consider upgrading to Starter plan ($7/month).

### Issue: CORS errors in browser console
**Solution**: Update Flask CORS in `server.py`:
```python
CORS(app, resources={r"/api/*": {
    "origins": ["https://your-frontend-url.vercel.app"],
    "methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["Content-Type"]
}})
```

### Issue: Environment variables not loading
**Solution**: 
- Verify all vars are set in Render/Vercel dashboard
- Frontend vars must start with `NEXT_PUBLIC_` to be visible
- Redeploy after adding variables

### Issue: MongoDB connection failing
**Solution**:
- Verify connection string is correct
- Add your Render/Vercel IP to MongoDB Atlas whitelist (allow all: `0.0.0.0/0`)
- Check MONGO_URI doesn't have special characters that need URL encoding

### Issue: NextAuth not working
**Solution**:
- Ensure `NEXTAUTH_URL` matches your Vercel domain
- Regenerate `NEXTAUTH_SECRET` and update
- Check `MONGODB_URI` is correct in frontend environment

---

## Step 6: Auto-Deployment Setup

### Render (Automatic)
- By default, Render re-deploys on every GitHub push
- No additional setup needed

### Vercel (Automatic)
- By default, Vercel re-deploys on every GitHub push to main/master
- Configure in Project Settings → Git if needed

---

## Optional: Custom Domain

### Vercel Custom Domain
1. Go to Project Settings → Domains
2. Add your domain (e.g., `myapp.com`)
3. Follow DNS setup instructions

### Render Custom Domain
1. Go to Service Settings → Custom Domain
2. Add your domain
3. Follow CNAME setup instructions

---

## Useful Commands

Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

Test local deployment:
```bash
# Test backend
cd backend-scrappers
python server.py

# Test frontend (in another terminal)
cd frontend
npm run build
npm start
```

Check Render logs:
```bash
# In Render dashboard → Logs
```

Check Vercel logs:
```bash
# In Vercel dashboard → Deployments → Logs
```

---

## Architecture Summary

```
┌─────────────────────────────────────┐
│  Frontend (Vercel)                  │
│  https://app.vercel.app             │
│  - Next.js 14.2.5                   │
│  - NextAuth for authentication      │
│  - MongoDB for user data            │
└──────────────┬──────────────────────┘
               │
               │ API Calls
               │
┌──────────────▼──────────────────────┐
│  Backend (Render)                   │
│  https://app.onrender.com           │
│  - Flask API                        │
│  - Web Scrapers (Reddit, YouTube)   │
│  - Sentiment Analysis               │
│  - MongoDB for review data          │
└─────────────────────────────────────┘
               │
               │
┌──────────────▼──────────────────────┐
│  MongoDB Atlas (Shared)             │
│  - User collection                  │
│  - Reviews collection               │
└─────────────────────────────────────┘
```

---

## Support & Next Steps

1. **Monitor deployments**: Check Vercel & Render dashboards regularly
2. **Set up alerts**: Enable email notifications for deployment failures
3. **Scale when needed**: Upgrade plans if hitting rate limits
4. **Performance optimization**: Add caching headers, optimize images
5. **Security**: Review API keys, enable 2FA on accounts

Good luck with your deployment! 🚀
