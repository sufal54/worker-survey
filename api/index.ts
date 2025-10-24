import type { VercelRequest, VercelResponse } from '@vercel/node';
import { login, logout, me, user, validate, serveryResponce, serverySave, serverySubmit, dashboardStats, dashboardSectionAverages, dashboardResponses, dashboardCompanyInsights, dashboardResponsesWithUsers, dashboardResponseByNumber, dashboarWellbeingMetrics, dashboardDemographicBreakdown, dashboardHrAccounts, dashboardExportCsv, adminGetCompanies, adminGetEmployees, adminCreateCertification, adminGetCertifications, adminRevokeCertification } from './_lib/funs.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const path = req.url?.replace(/^\/api/, '') || '';


    switch (path) {
        // HR Routes
        case '/hr/login':
            return await login(req, res);
        case '/hr/logout':
            return await logout(req, res);
        case '/hr/me':
            return await me(req, res);

        // Auth Routes
        case '/auth/validate':
            return await validate(req, res);
        case '/auth/user':
            return await user(req, res);

        // Survey Routes
        case '/survey/response':
            return await serveryResponce(req, res);
        case '/survey/save':
            return await serverySave(req, res);
        case '/survey/submit':
            return await serverySubmit(req, res);

        // Dashboard Routes
        case '/dashboard/stats':
            return await dashboardStats(req, res);
        case '/dashboard/section-averages':
            return await dashboardSectionAverages(req, res);
        case '/dashboard/responses':
            return await dashboardResponses(req, res);
        case '/dashboard/company-insights':
            return await dashboardCompanyInsights(req, res);
        case '/dashboard/responses-with-users':
            return await dashboardResponsesWithUsers(req, res);
        case '/dashboard/response/:responseNumber': // dynamic route, handle inside function
            return await dashboardResponseByNumber(req, res);
        case '/dashboard/wellbeing-metrics':
            return await dashboarWellbeingMetrics(req, res);
        case '/dashboard/demographic-breakdown':
            return await dashboardDemographicBreakdown(req, res);
        case '/dashboard/hr-accounts':
            return await dashboardHrAccounts(req, res);
        case '/dashboard/export-csv':
            return await dashboardExportCsv(req, res);

        // Admin Routes
        case '/admin/companies':
            return await adminGetCompanies(req, res);
        case '/admin/employees':
            return await adminGetEmployees(req, res);
        case '/admin/certifications':
            if (req.method === 'POST') return await adminCreateCertification(req, res);
            if (req.method === 'GET') return await adminGetCertifications(req, res);
            break;
        case '/admin/certifications/:id/revoke':
            return await adminRevokeCertification(req, res);

        default:
            return res.status(404).json({ message: 'Not found' });
    }
}
