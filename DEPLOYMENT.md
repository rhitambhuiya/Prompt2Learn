# Deployment Guide: Netlify + Render

## Prerequisites
1. GitHub repository with your code
2. Netlify account
3. Render account
4. PostgreSQL database (Neon or Render)

## Step 1: Deploy Backend to Render

### 1.1 Prepare Backend
- Your backend is already configured for Render
- Make sure `backend/package.json` has the correct start script
- Environment variables will be set in Render dashboard

### 1.2 Deploy to Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `prompt2learn-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 1.3 Set Environment Variables in Render
In Render dashboard, go to your service → Environment:
```
GEMINI_API_KEY=your_actual_gemini_key
DATABASE_URL=your_postgresql_connection_string
NODE_ENV=production
```

### 1.4 Get Your Backend URL
After deployment, you'll get a URL like: `https://your-app-name.onrender.com`

## Step 2: Deploy Frontend to Netlify

### 2.1 Update Frontend Configuration
1. Update `frontend/src/config.js` with your actual Render backend URL
2. Make sure `frontend/netlify.toml` is in place

### 2.2 Deploy to Netlify
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "New site from Git"
3. Connect your GitHub repository
4. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

### 2.3 Update Backend CORS
After getting your Netlify URL, update `backend/src/server.js` CORS settings with your actual Netlify URL.

## Step 3: Database Setup

### Option A: Neon (Recommended)
1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project
3. Copy the connection string
4. Use this as your `DATABASE_URL` in Render

### Option B: Render PostgreSQL
1. In Render dashboard, create a new PostgreSQL database
2. Use the provided connection string

## Step 4: Final Configuration

### 4.1 Update API URLs
1. Get your Render backend URL
2. Update `frontend/src/config.js` with the actual URL
3. Redeploy frontend to Netlify

### 4.2 Update CORS
1. Get your Netlify frontend URL
2. Update `backend/src/server.js` CORS settings
3. Redeploy backend to Render

## Environment Variables Summary

### Frontend (Netlify)
- No environment variables needed (uses config.js)

### Backend (Render)
- `GEMINI_API_KEY`: Your Google Gemini API key
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: production

## URLs After Deployment
- **Frontend**: `https://your-app-name.netlify.app`
- **Backend**: `https://your-app-name.onrender.com`

## Troubleshooting
1. Check Render logs for backend issues
2. Check Netlify build logs for frontend issues
3. Ensure CORS settings match your actual URLs
4. Verify environment variables are set correctly
