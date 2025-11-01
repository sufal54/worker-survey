import type { VercelRequest, VercelResponse } from '@vercel/node';
import { login, logout, me, user, validate, serveryResponce, serverySave, serverySubmit, dashboardStats, dashboardSectionAverages, dashboardResponses, dashboardCompanyInsights, dashboardResponsesWithUsers, dashboardResponseByNumber, dashboarWellbeingMetrics, dashboardDemographicBreakdown, dashboardHrAccounts, dashboardExportCsv, adminGetCompanies, adminGetEmployees, adminCreateCertification, adminGetCertifications, adminRevokeCertification } from './_lib/funs.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const path = req.url?.replace(/^\/api/, '') || '';

    switch (true) {
        // HR Routes
        case path.startsWith('/hr/login'):
            return await login(req, res);
        case path.startsWith('/hr/logout'):
            return await logout(req, res);
        case path.startsWith('/logout'):
            return await logout(req, res);
        case path.startsWith('/hr/me'):
            return await me(req, res);

        // Auth Routes
        case path.startsWith('/auth/validate'):
            return await validate(req, res);
        case path.startsWith('/auth/user'):
            return await user(req, res);

        // Survey Routes
        case path.startsWith("/survey/response"):
            return await serveryResponce(req, res);
        case path.startsWith('/survey/save'):
            return await serverySave(req, res);
        case path.startsWith('/survey/submit'):
            return await serverySubmit(req, res);

        // Dashboard Routes
        case path.startsWith('/dashboard/stats'):
            return await dashboardStats(req, res);
        case path.startsWith('/dashboard/section-averages'):
            return await dashboardSectionAverages(req, res);
        case path === "/dashboard/responses": {

            return await dashboardResponses(req, res);
        }

        case path.startsWith('/dashboard/company-insights'):
            return await dashboardCompanyInsights(req, res);
        case path.startsWith('/dashboard/responses-with-users'):
            return await dashboardResponsesWithUsers(req, res);

        // Dynamic dashboard response route
        case /^\/dashboard\/response\/\d+$/.test(path): {
            const match = path.match(/^\/dashboard\/response\/(\d+)$/);

            if (match) {
                const responseNumberParam = match[1];
                console.log("Response ID:", responseNumberParam);

                return await dashboardResponseByNumber(req, res, responseNumberParam);
            }

            res.status(400).send("Invalid path");
            break;
        }

        case path.startsWith('/dashboard/wellbeing-metrics'):
            return await dashboarWellbeingMetrics(req, res);
        case path.startsWith('/dashboard/demographic-breakdown'):
            return await dashboardDemographicBreakdown(req, res);
        case path.startsWith('/dashboard/hr-accounts'):
            return await dashboardHrAccounts(req, res);
        case path.startsWith('/dashboard/export-csv'):
            return await dashboardExportCsv(req, res);

        // Admin Routes
        case path.startsWith('/admin/companies'):
            return await adminGetCompanies(req, res);
        case path.startsWith("/admin/employees"):
            return await adminGetEmployees(req, res);
        case /^\/admin\/certifications\/\d+\/revoke$/.test(path): {
            const match = path.match(/^\/admin\/certifications\/(\d+)\/revoke$/);
            const id = match ? parseInt(match[1], 10) : NaN;
            if (isNaN(id)) {
                return res.status(400).json({ message: "Invalid certification ID" });
            }
            return await adminRevokeCertification(req, res, id);
        }
        case path.startsWith('/admin/certifications'):
            if (req.method === 'POST') return await adminCreateCertification(req, res);
            if (req.method === 'GET') return await adminGetCertifications(req, res);

        default:
            return res.status(404).json({ message: 'Not found' });
    }

}
