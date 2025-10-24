# Production Deployment Checklist

Use this checklist to ensure a smooth, secure production deployment.

## Pre-Deployment

### 1. Environment Setup
- [ ] DATABASE_URL configured in Vercel environment variables
- [ ] Database is accessible from Vercel (check firewall/IP restrictions)
- [ ] Node.js version set to 20.x in Vercel settings
- [ ] All required dependencies in package.json

### 2. Database Configuration
- [ ] Run `npm run db:push` to create all tables
- [ ] Verify tables exist: companies, hr_accounts, sessions, users, survey_responses
- [ ] Create production admin account with secure password
- [ ] Delete any test/demo accounts

### 3. Code Quality
- [ ] No console.log statements in production code
- [ ] Error handling implemented for all API routes
- [ ] TypeScript compilation successful (`npm run check`)
- [ ] Build completes without errors (`npm run build`)

### 4. Security
- [ ] Security headers configured (auto-configured in api/index.ts)
- [ ] Session cookies use httpOnly and secure flags
- [ ] CORS configured appropriately
- [ ] SQL injection prevention (using Drizzle ORM parameterized queries)
- [ ] Input validation on all forms (Zod schemas)
- [ ] Admin password is strong and secure

## Deployment

### 5. Initial Deploy
- [ ] Connect repository to Vercel
- [ ] Trigger first deployment
- [ ] Monitor build logs for errors
- [ ] Check deployment preview URL

### 6. Verification
- [ ] Homepage loads correctly
- [ ] Employee survey authentication works
- [ ] Survey submission successful
- [ ] Response ID generated correctly
- [ ] HR login works with admin credentials
- [ ] Dashboard displays correct data
- [ ] Company analytics visible for admin
- [ ] CSV export functions correctly
- [ ] Dark/light mode toggle works
- [ ] Mobile responsive design verified

### 7. Multi-Tenant Testing
- [ ] Create test survey responses from different company domains
- [ ] Verify HR accounts auto-created per company
- [ ] Test data isolation (HR can only see their company)
- [ ] Admin can see all companies
- [ ] Company insights display correctly

## Post-Deployment

### 8. Monitoring
- [ ] Set up Vercel error tracking
- [ ] Monitor database connection pool
- [ ] Check serverless function logs
- [ ] Set up uptime monitoring (optional)

### 9. Performance
- [ ] Test page load times (<3s)
- [ ] Verify database query performance
- [ ] Check serverless function cold start time
- [ ] Test with concurrent users (if possible)

### 10. Documentation
- [ ] Update README with production URL
- [ ] Document admin credentials securely (use password manager)
- [ ] Create user guide for HR portal access
- [ ] Document any custom configurations

## Security Audit

### 11. Final Security Review
- [ ] All secrets stored in environment variables (not in code)
- [ ] Test accounts removed
- [ ] Default passwords changed
- [ ] Session timeout configured appropriately (7 days)
- [ ] XSS protection headers enabled
- [ ] HTTPS enforced (Vercel default)

## Go Live

### 12. Launch Preparation
- [ ] Backup database before going live
- [ ] Announce maintenance window (if migrating from existing system)
- [ ] Prepare rollback plan
- [ ] Have support contact ready

### 13. Launch
- [ ] Promote preview to production
- [ ] Verify production URL works
- [ ] Send access instructions to HR teams
- [ ] Monitor error logs for first 24 hours

## Post-Launch

### 14. Week 1 Monitoring
- [ ] Check error rates daily
- [ ] Monitor database size growth
- [ ] Review session management
- [ ] Gather user feedback
- [ ] Address any critical issues immediately

### 15. Maintenance Plan
- [ ] Schedule regular database backups
- [ ] Plan for schema updates
- [ ] Document upgrade procedures
- [ ] Set up dependency update alerts

---

## Quick Reference

### Admin Account Creation
```bash
# Generate password hash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YOUR_PASSWORD', 10, (err, hash) => console.log(hash));"

# Then run SQL (replace values):
INSERT INTO companies (domain, name) VALUES ('company.com', 'Company Name') RETURNING id;
INSERT INTO hr_accounts (company_id, email, password_hash, role) 
VALUES (1, 'admin@company.com', '<hash>', 'admin');
```

### Emergency Rollback
```bash
# Rollback to previous deployment
vercel rollback <deployment-url>

# Or in Vercel dashboard:
# Deployments > Click previous deployment > Promote to Production
```

### Database Reset (DANGER - Development Only!)
```bash
# NEVER run in production!
npm run db:push --force
```

## Support Contacts

- Vercel Support: https://vercel.com/support
- Database Provider Support: [Your DB Provider]
- Development Team: [Your Team Contact]

---

**Last Updated**: October 2025
**Version**: 1.0.0
