# Excellent Place to Work Certification Survey Platform

## Overview
A professional employee survey platform designed for workplace certification. The platform enables employees to complete a comprehensive 50-question survey with verified work email authentication. All responses are securely stored for legal documentation with unique tracking IDs, providing company-wise insights and supporting compliance requirements. The platform includes a multi-tenant HR portal for secure, role-based access to company-specific analytics.

## User Preferences
- Professional, enterprise-focused design
- Trust and credibility emphasized for legal documentation
- Mobile-responsive with flawless UX across devices
- Minimal, purposeful animations
- WCAG 2.1 AA accessibility compliance
- Clear data tracking with unique identifiers

## System Architecture

### UI/UX Decisions
- **Color Scheme**: Professional blue (214 95% 50% light, 214 100% 65% dark) inspired by Power BI teal (#01B8AA) with neutral grays.
- **Typography**: Inter font for readability.
- **Layout**: Card-based design with shadow-lg, max-w-3xl containers, light gray background (#F5F5F5), and a grid layout for professional spacing.
- **Features**: Dark/light mode toggle, sticky progress header, section-based navigation, tabbed interface, and professional sidebar navigation using Shadcn primitives.
- **Accessibility**: WCAG 2.1 AA compliant.

### Technical Implementations & Features
- **Multi-Tenant HR Portal**:
    - **Authentication**: Session-based with HttpOnly cookies and bcrypt password hashing. HR login uses company domain email (hr@company.com).
    - **Role-Based Access Control**: "Admin" has full system access; "HR" can only view their company's data.
    - **Data Isolation**: Middleware enforces company-specific data access.
    - **Auto-Provisioning**: HR accounts and companies are auto-created upon the first employee survey submission from a new company.
    - **Dashboard**: Company-specific analytics, CSV export, and protected routes.
- **Response ID System**: Auto-generated unique IDs (RESP-####) displayed post-completion, searchable in the dashboard, and used for "Already Submitted" detection.
- **Company Analytics**: Auto-extracts company domain for tracking responses, calculating average scores, and completion rates per company.
- **Enhanced Dashboard**:
    - **Search**: By Response ID with detailed investigation of all 50 questions, organized by sections with color-coded answers.
    - **Tabs**: Overview, Company Insights, All Responses (detailed list with employee info).
    - **Demographic Analysis**: Collects department, education, gender, tenure data during authentication. Provides well-being metrics (Success Score, Pride Index, Happiness Level, Overall Satisfaction) with gauge charts and advanced filtering by demographics.
    - **Demographic Breakdown**: Interactive charts showing participation distribution.
- **Survey Structure**: 5 sections (Leadership & Vision, Employee Wellbeing & Happiness, Communication, Values & Recognition, Inclusion & Trust) each with 10 questions. Response scale: Strongly Disagree to Strongly Agree.

### System Design Choices
- **Data Models**:
    - **Sessions**: Replit Auth and HR session management.
    - **Companies**: Stores company records (name, domain).
    - **HR Accounts**: HR user accounts with email, hashed password, role, and companyId.
    - **Users**: Employee authentication with personal details and demographic fields.
    - **Survey Responses**: Stores 50 answers as JSONB, unique `responseNumber` (RESP-####), `companyDomain`, `companyId`, and timestamps.
- **API Endpoints**: Structured for survey submission, HR authentication (login, logout, me), and protected dashboard functionalities (stats, section averages, company insights, responses, well-being metrics, demographic breakdown, CSV export).
- **Storage Layer**: Manages response creation, retrieval, company insights aggregation, dashboard statistics, and section average calculations. Supports demographic filtering for well-being metrics.
- **Serverless Compatibility**: Designed for Vercel deployment with API routes configured as serverless functions.

### Technology Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI, Recharts.
- **Backend**: Express.js.
- **Authentication**: Replit Auth (for employees), custom session-based (for HR).
- **State Management**: TanStack Query.
- **Database**: PostgreSQL (Supabase/Vercel Postgres) with Drizzle ORM.

## External Dependencies
- **PostgreSQL**: Primary database for all data storage (via Drizzle ORM).
- **Replit Auth**: Used for employee work email verification.
- **Vercel**: Deployment platform.

## Deployment Status
- ✅ **Production Ready**: All features verified and tested
- ✅ **Vercel Configured**: `vercel.json` and `api/index.ts` serverless function ready
- ✅ **Build Process**: Tested and working (`npm run build`)
- ✅ **Database**: Supabase PostgreSQL connected and schema synced
- ✅ **Environment Variables**: Documented in `ENV_VARIABLES.md`
- ✅ **Deployment Guide**: Comprehensive guides in `VERCEL_DEPLOYMENT.md` and `DEPLOYMENT.md`
- ✅ **Security**: HttpOnly cookies, role-based access, multi-tenant isolation
- ✅ **Admin Account**: `admin@admin.com` / `admin@123` (change in production)