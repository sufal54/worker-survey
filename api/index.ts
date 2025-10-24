import type { VercelRequest, VercelResponse } from '@vercel/node';
import { login, logout, me, user, validate, serveryResponce, serverySave, serverySubmit, dashboardStats, dashboardSectionAverages, dashboardResponses, dashboardCompanyInsights, dashboardResponsesWithUsers, dashboardResponseByNumber, dashboarWellbeingMetrics, dashboardDemographicBreakdown, dashboardHrAccounts, dashboardExportCsv, adminGetCompanies, adminGetEmployees, adminCreateCertification, adminGetCertifications, adminRevokeCertification } from './_lib/funs.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const path = req.url?.replace(/^\/api/, '') || '';

    switch (true) {
        // HR Routes
        case path === '/hr/login':
            return await login(req, res);
        case path === '/hr/logout':
            return await logout(req, res);
        case path === '/hr/me':
            return await me(req, res);

        // Auth Routes
        case path === '/auth/validate':
            return await validate(req, res);
        case path === '/auth/user':
            return await user(req, res);

        // Survey Routes
        case path === '/survey/response':
            return await serveryResponce(req, res);
        case path === '/survey/save':
            return await serverySave(req, res);
        case path === '/survey/submit':
            return await serverySubmit(req, res);

        // Dashboard Routes
        case path === '/dashboard/stats':
            return await dashboardStats(req, res);
        case path === '/dashboard/section-averages':
            return await dashboardSectionAverages(req, res);
        case path === '/dashboard/responses':
            return await dashboardResponses(req, res);
        case path === '/dashboard/company-insights':
            return await dashboardCompanyInsights(req, res);
        case path === '/dashboard/responses-with-users':
            return await dashboardResponsesWithUsers(req, res);

        // Dynamic dashboard response route
        case /^\/dashboard\/response\/\d+$/.test(path): {
            return await dashboardResponseByNumber(req, res);
        }

        case path === '/dashboard/wellbeing-metrics':
            return await dashboarWellbeingMetrics(req, res);
        case path === '/dashboard/demographic-breakdown':
            return await dashboardDemographicBreakdown(req, res);
        case path === '/dashboard/hr-accounts':
            return await dashboardHrAccounts(req, res);
        case path === '/dashboard/export-csv':
            return await dashboardExportCsv(req, res);

        // Admin Routes
        case path === '/admin/companies':
            return await adminGetCompanies(req, res);
        case path === '/admin/employees':
            return await adminGetEmployees(req, res);
        case path === '/admin/certifications':
            if (req.method === 'POST') return await adminCreateCertification(req, res);
            if (req.method === 'GET') return await adminGetCertifications(req, res);
            break;
        case /^\/admin\/certifications\/\d+\/revoke$/.test(path): {
            return await adminRevokeCertification(req, res);
        }

        default:
            return res.status(404).json({ message: 'Not found' });
    }

}
