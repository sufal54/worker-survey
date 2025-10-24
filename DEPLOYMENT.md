# Deployment Guide for Vercel

This multi-tenant survey analytics platform is configured for deployment on Vercel with zero configuration needed.

> **🚀 Quick Start**: See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for a 5-minute deployment guide!

## Prerequisites

1. A Vercel account (free tier works)
2. A PostgreSQL database (already configured with Supabase)
3. Git repository connected to Vercel

## Database Setup

**Database Options**:
1. **Supabase PostgreSQL** (Recommended) - Full-featured, includes connection pooling
2. **Vercel Postgres** - Native Vercel integration
3. **Any PostgreSQL provider** - AWS RDS, Railway, etc.

**⚠️ IMPORTANT**: The DATABASE_URL contains sensitive credentials. Never hardcode it in your code files. Always use environment variables.

## Deployment Steps

### 1. Database Setup

**Required Steps**:

1. **Create a PostgreSQL database** (choose one):
   - Supabase: Create new project → Get connection string (Connection pooling)
   - Vercel Postgres: Vercel dashboard → Storage → Create Database
   - Other provider: Set up PostgreSQL 14+ with connection pooling

2. **Push database schema**:
   ```bash
   # Set DATABASE_URL locally
   export DATABASE_URL="your_connection_string"
   
   # Push schema to database
   npm run db:push
   ```

3. **Verify schema**:
   - Tables created: companies, hr_accounts, users, survey_responses, sessions
   - Multi-tenant structure configured

### 2. Configure Environment Variables in Vercel

In your Vercel project settings:

1. Go to "Settings" → "Environment Variables"
2. Add the following variable:

   **Name**: `DATABASE_URL`  
   **Value**: `[Your PostgreSQL connection string from Supabase/Vercel Postgres]`  
   **Environments**: Check all (Production, Preview, Development)

**Where to Get It**:
- **Supabase**: Settings → Database → Connection String (Connection pooling)
- **Vercel Postgres**: Storage → Your Database → `.env.local` tab

**Important**: Vercel automatically injects environment variables into your serverless functions.

### 3. Deploy to Vercel

**Method 1: Using Vercel CLI**
```bash
# Install Vercel CLI globally
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

**Method 2: Using Git Integration**
1. Push your code to GitHub/GitLab/Bitbucket
2. Import the repository in Vercel dashboard
3. Vercel will auto-detect the configuration and deploy

### 5. Verify Deployment

After deployment:
1. Visit your deployment URL
2. Test the survey functionality
3. Check the dashboard works correctly
4. Verify database connectivity

## Build Configuration

The project is pre-configured with:

- **Build Command**: `npm run build`
- **Output Directory**: `dist/public`
- **Node Version**: 20.x
- **Framework**: None (Custom Express + React setup)
- **Serverless Function**: `api/index.ts` handles all routes (API + static files)

These are already set in `vercel.json` and require no changes.

### How It Works

1. All requests (API and static) are routed to the serverless function at `api/index.ts`
2. The function initializes the Express app with all API routes
3. API routes are handled by Express
4. Static files are served from `dist/public`
5. Client-side routes fallback to `index.html` for React Router

## Important Files

- `vercel.json`: Vercel configuration (routes, environment, build settings)
- `api/index.ts`: Serverless function entry point
- `.vercelignore`: Files to exclude from deployment

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Verify Node version compatibility (20.x)
- Check build logs in Vercel dashboard

### Database Connection Issues
- Verify `DATABASE_URL` is set correctly
- Ensure database schema is pushed (`npm run db:push`)
- Check database provider is accessible from Vercel

### API Routes Not Working
- Verify `vercel.json` configuration is correct
- Check serverless function logs in Vercel dashboard
- Ensure `api/index.ts` is being deployed

### Frontend Not Loading
- Check build output in `dist/public`
- Verify static files are being served
- Check browser console for errors

## Admin Account Setup

After deploying and pushing the schema, you'll need to create an admin account to access the HR portal:

### Create Admin Account (One-time Setup)

1. Connect to your production database
2. Run the following SQL commands:

```sql
-- First, ensure a company exists
INSERT INTO companies (domain, name) 
VALUES ('yourcompany.com', 'Your Company Name') 
ON CONFLICT (domain) DO NOTHING
RETURNING id;

-- Create admin account (replace values as needed)
-- Note: The password hash below is for 'admin123' - CHANGE THIS!
INSERT INTO hr_accounts (company_id, email, password_hash, role, must_reset_password) 
VALUES (
  1,  -- Replace with your company ID from above
  'admin@yourcompany.com',  -- Your admin email
  '$2b$10$h1rkkP8mj5bb4pYMFIPiyuC/qie21Kz7ts6DMJQpJsdGkJiGMLVTa',  -- CHANGE PASSWORD!
  'admin', 
  false
);
```

**To create a secure password hash:**
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YOUR_SECURE_PASSWORD', 10, (err, hash) => console.log(hash));"
```

### Default Test Credentials (Development Only)

For testing purposes, a test admin account is available:
- **Email**: admin@testcompany.com
- **Password**: admin123
- ⚠️ **IMPORTANT**: Delete this account in production!

## Production Checklist

Before going live:

- [ ] Database schema pushed (`npm run db:push`)
- [ ] Environment variables configured in Vercel
- [ ] Admin account created with secure password
- [ ] Test admin account deleted (if in production)
- [ ] Application tested in preview deployment
- [ ] All features working (survey submission, dashboard, search)
- [ ] Response ID system working correctly
- [ ] Session management and cookies tested
- [ ] Multi-tenant data isolation verified
- [ ] Database queries optimized
- [ ] Error handling tested
- [ ] Security headers enabled (auto-configured)
- [ ] HTTPS/SSL enabled (Vercel auto-configures)

## Support

For deployment issues:
- Check Vercel documentation: https://vercel.com/docs
- Review build logs in Vercel dashboard
- Check database provider documentation
