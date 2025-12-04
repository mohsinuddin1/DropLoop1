# Deploy DropLoop to Vercel via GitHub

## Prerequisites

1. **GitHub Account** - You need a GitHub account
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free tier available)
3. **Git Repository** - Your code should be in a GitHub repository

## Step-by-Step Deployment Process

### 1. Prepare Your Repository

#### Check .gitignore
Your `.gitignore` file is properly configured and will exclude:
- `node_modules/`
- `dist/` (build output)
- Log files
- Editor configs
- Local environment files

✅ **Good**: Sensitive files like `.env.local` are already ignored.

#### Important: Environment Variables
Before deploying, you'll need to set up environment variables in Vercel. Your app uses:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

### 2. Push Code to GitHub

If you haven't already:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - DropLoop app"

# Create a repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 3. Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign in (or sign up with GitHub)

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Authorize Vercel to access your GitHub account
   - Select your repository (`DropLoop1` or your repo name)

3. **Configure Project**
   - **Framework Preset**: Vite (should auto-detect)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)
   - **Install Command**: `npm install` (default)

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add the following:
     ```
     VITE_SUPABASE_URL=your_supabase_url_here
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
     ```
   - Click "Save"

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (usually 1-3 minutes)

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No (first time)
# - Project name? droploop (or your choice)
# - Directory? ./
# - Override settings? No

# For production deployment:
vercel --prod
```

### 4. Post-Deployment Configuration

#### Set Environment Variables in Vercel Dashboard

1. Go to your project on Vercel
2. Click **Settings** → **Environment Variables**
3. Add:
   - `VITE_SUPABASE_URL` = Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase anonymous key
4. Click **Save**
5. **Redeploy** (Vercel will automatically redeploy when env vars change)

#### Update Firebase Configuration

Your Firebase config in `src/firebase/config.js` uses hardcoded values. For production:
- Consider moving sensitive keys to environment variables
- Or keep as-is if the keys are meant to be public (Firebase client keys are typically safe to expose)

### 5. Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Vercel will automatically provision SSL certificate

## Automatic Updates

✅ **YES, Vercel supports automatic updates!**

### How It Works:

1. **Automatic Deployments on Push**
   - Every push to `main` branch automatically triggers a new deployment
   - Vercel builds and deploys your latest code
   - You get a new deployment URL for each push

2. **Preview Deployments**
   - Pull requests get preview deployments
   - Each PR gets its own unique URL
   - Perfect for testing before merging

3. **Deployment Workflow**
   ```
   Push to GitHub → Vercel detects change → Builds app → Deploys → Live!
   ```

### Deployment Settings

To configure auto-deployments:

1. Go to **Settings** → **Git**
2. **Production Branch**: `main` (or `master`)
3. **Auto-deploy**: Enabled by default
4. **Preview Deployments**: Enabled for all branches/PRs

## Updating Your App

### Method 1: Automatic (Recommended)

```bash
# Make your changes locally
git add .
git commit -m "Your update message"
git push origin main

# Vercel automatically:
# - Detects the push
# - Builds the new version
# - Deploys it
# - Your site is updated in ~2-3 minutes
```

### Method 2: Manual Redeploy

1. Go to Vercel Dashboard
2. Select your project
3. Click **Deployments** tab
4. Click **⋯** (three dots) on any deployment
5. Click **Redeploy**

## Build Configuration

Your `package.json` already has the correct build script:
```json
"build": "vite build"
```

Vercel will automatically:
- Run `npm install`
- Run `npm run build`
- Serve files from `dist/` directory

## Troubleshooting

### Build Fails

1. **Check Build Logs**
   - Go to deployment → View build logs
   - Look for error messages

2. **Common Issues**:
   - Missing environment variables → Add them in Vercel settings
   - Build errors → Check console for specific errors
   - Dependencies → Ensure all are in `package.json`

### Environment Variables Not Working

1. Make sure variables start with `VITE_` (for Vite projects)
2. Redeploy after adding/changing env vars
3. Check variable names match exactly (case-sensitive)

### Firebase/Supabase Connection Issues

1. Check CORS settings in Firebase/Supabase
2. Add Vercel domain to allowed origins
3. Verify environment variables are set correctly

## Recommended .gitignore Additions

Your current `.gitignore` is good, but consider adding:

```gitignore
# Environment variables
.env
.env.local
.env.production.local
.env.development.local

# Vercel
.vercel
```

## Security Notes

1. **Never commit**:
   - `.env` files with secrets
   - Firebase service account keys
   - Supabase service role keys

2. **Safe to commit**:
   - Firebase client config (public keys)
   - Public API keys (like Supabase anon key)
   - Build configuration files

## Quick Reference

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Documentation**: https://vercel.com/docs
- **Support**: https://vercel.com/support

---

## Summary

✅ **Deployment Process**:
1. Push code to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

✅ **Automatic Updates**:
- Every `git push` to main = automatic deployment
- PRs get preview deployments
- No manual steps needed after initial setup

✅ **Your .gitignore is properly configured** - sensitive files won't be committed

