# Environment Variables Reference

## Required Environment Variables

### DATABASE_URL
**Description**: PostgreSQL connection string for the application database  
**Provider**: Supabase PostgreSQL  
**Format**: `postgresql://[user]:[password]@[host]:[port]/[database]`  
**Required**: Yes  
**Environments**: Production, Preview, Development

**Example Format**:
```
postgresql://[username]:[password]@[host]:[port]/[database]
```

**Where to Get It**:
- **Supabase**: Project Settings → Database → Connection String (use "Connection pooling" mode)
- **Vercel Postgres**: Storage → Your Database → `.env.local` tab
- **Other PostgreSQL**: Your database provider's connection settings

**Usage**:
- All database operations (queries, migrations)
- Drizzle ORM connection
- Session storage
- Survey response storage
- HR account management

**Security**:
- ⚠️ Keep this secret - contains database credentials
- Never commit to Git
- Use Vercel environment variables for deployment
- Automatically injected into serverless functions

---

## Optional Environment Variables

### NODE_ENV
**Description**: Application environment mode  
**Values**: `development` | `production`  
**Required**: No (auto-set by Vercel)  
**Default**: `development` (local), `production` (Vercel)

**Usage**:
- Controls logging verbosity
- Development mode shows detailed errors
- Production mode shows minimal errors for security

---

## Environment Setup

### Local Development (.env)
```bash
DATABASE_URL=postgresql://[username]:[password]@[host]:[port]/[database]
NODE_ENV=development
```

### Vercel Production

In Vercel Dashboard → Settings → Environment Variables:

| Name | Value | Environments |
|------|-------|--------------|
| `DATABASE_URL` | Your PostgreSQL connection string | ✅ All |

---

## Database Configuration

### Current Database: Supabase PostgreSQL

**Typical Configuration**:
- **Host**: Your database host (e.g., `db.supabase.co` or `postgres.vercel-storage.com`)
- **Port**: `5432` (standard PostgreSQL port)
- **Database**: Your database name
- **User**: Your database username
- **SSL**: Enabled by default (recommended)
- **Connection Pooling**: Recommended for serverless (Supabase/Vercel provide this)

**Schema Status**: ✅ Fully synced and ready

**Tables**:
- `companies` - Company records
- `hr_accounts` - HR and admin users
- `users` - Employee authentication
- `survey_responses` - Survey submissions
- `sessions` - Session management
- `certifications` - Certification records

---

## Security Best Practices

### DO ✅
- Use environment variables for all secrets
- Set variables in Vercel dashboard
- Use different values for dev/staging/prod
- Enable SSL for database connections
- Rotate credentials periodically

### DON'T ❌
- Commit `.env` files to Git
- Hardcode secrets in code
- Share credentials in plain text
- Use same password for all environments
- Log sensitive environment variables

---

## Accessing Environment Variables

### Backend (Node.js/Express)
```typescript
// Access DATABASE_URL
const databaseUrl = process.env.DATABASE_URL;

// Check environment
const isDev = process.env.NODE_ENV === 'development';
```

### Frontend (React/Vite)
```typescript
// Vite only exposes variables prefixed with VITE_
const apiUrl = import.meta.env.VITE_API_URL;

// Note: DATABASE_URL is backend-only, not exposed to frontend
```

---

## Troubleshooting

### "DATABASE_URL is not defined"
**Cause**: Environment variable not set  
**Solution**: 
1. Check Vercel environment variables
2. Verify `.env` exists locally
3. Restart dev server after adding `.env`

### "Connection refused"
**Cause**: Database not accessible  
**Solution**:
1. Check database is running
2. Verify connection string format
3. Ensure IP whitelisting (if applicable)
4. Test connection: `psql $DATABASE_URL`

### "SSL connection required"
**Cause**: Database requires SSL  
**Solution**:
- Supabase auto-enables SSL
- No additional configuration needed
- Connection pooler handles SSL

---

## Migration & Schema Management

### Push Schema Changes
```bash
# Development
npm run db:push

# Force push (data loss warning)
npm run db:push --force
```

### Verify Schema
```bash
# Connect to database
psql $DATABASE_URL

# List tables
\dt

# Check schema
\d table_name
```

---

## Multi-Environment Setup

### Development (Local)
```bash
DATABASE_URL=postgresql://localhost:5432/survey_dev
NODE_ENV=development
```

### Staging (Vercel Preview)
```bash
DATABASE_URL=postgresql://[staging-db-url]
NODE_ENV=production
```

### Production (Vercel)
```bash
DATABASE_URL=[Your production database connection string]
NODE_ENV=production
```

---

## Environment Variable Checklist

Before deploying:

- [ ] `DATABASE_URL` set in Vercel
- [ ] Database accessible from Vercel
- [ ] Schema synced (`npm run db:push`)
- [ ] No `.env` files in Git
- [ ] Secure passwords used
- [ ] Admin credentials changed from defaults
- [ ] Connection pooling enabled
- [ ] SSL connections verified
- [ ] Variables set for all environments (Production, Preview, Development)

---

## Reference

### Vercel Environment Variables
[Vercel Docs](https://vercel.com/docs/concepts/projects/environment-variables)

### Supabase Connection
[Supabase Docs](https://supabase.com/docs/guides/database/connecting-to-postgres)

### Drizzle ORM
[Drizzle Docs](https://orm.drizzle.team/docs/overview)
