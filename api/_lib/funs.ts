import type { VercelRequest, VercelResponse } from '@vercel/node';
import { emailSchema, HRAccount, loginSchema, SurveyAnswers } from './shared/schema.js';
import { storage } from './storage.js';
import { fromError } from 'zod-validation-error';
import { saveSurveySchema, submitSurveySchema } from './shared/surveyValidation.js';

export async function requireHRAuth(req: VercelRequest, adminOnly = false): Promise<HRAccount> {
    // Parse cookie manually
    const cookieHeader = req.headers.cookie || "";
    const match = cookieHeader.match(/hr_session=([^;]+)/);
    const token = match?.[1];

    if (!token) throw new Error("Not authenticated");

    const session = await storage.getSession(token);
    if (!session) throw new Error("Invalid or expired session");

    const account = await storage.getHRAccountById(session.hrAccountId);
    if (!account) throw new Error("Account not found");

    if (adminOnly && account.role !== "admin") {
        throw new Error("Admin access required");
    }

    return account; // return the HR account
}


export function validateEmail(req: VercelRequest): string {
    const email = req.body?.email || req.query?.email;

    if (!email) {
        throw new Error("Email is required");
    }

    const result = emailSchema.safeParse(email);
    if (!result.success) {
        const validationError = fromError(result.error);
        throw new Error(validationError.message || "Invalid email format");
    }

    return result.data; // validated email
}


export const login = async (req: VercelRequest, res: VercelResponse) => {
    try {
        const result = loginSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ message: "Invalid login credentials" });
        }

        const { email, password } = result.data;
        const hrAccount = await storage.validateHRCredentials(email, password);

        if (!hrAccount) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Create session
        const session = await storage.createSession(hrAccount.id);
        await storage.updateLastLogin(hrAccount.id);

        // Set HTTP-only cookie
        const cookie = [
            `hr_session=${session.token}`,
            `Path=/`,
            `HttpOnly`,
            `SameSite=Lax`,
            `Max-Age=${7 * 24 * 60 * 60}`,
            process.env.NODE_ENV === "production" ? "Secure" : "",
        ]
            .filter(Boolean) // remove empty strings
            .join("; ");

        // Set header
        res.setHeader("Set-Cookie", cookie);
        res.json({
            success: true,
            account: {
                id: hrAccount.id,
                email: hrAccount.email,
                role: hrAccount.role,
                companyId: hrAccount.companyId,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Login failed" });
    }
}

export const logout = async (req: VercelRequest, res: VercelResponse) => {
    try {
        const token = req.cookies?.hr_session;
        if (token) {
            await storage.deleteSession(token);
        }
        const cookie = [
            `hr_session=`,
            `Path=/`,
            `HttpOnly`,
            `SameSite=Lax`,
            `Max-Age=0`,
            process.env.NODE_ENV === "production" ? "Secure" : "",
        ]
            .filter(Boolean)
            .join("; ");

        res.setHeader("Set-Cookie", cookie);
        res.json({ success: true });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ message: "Logout failed" });
    }
}

export const me = async (req: VercelRequest, res: VercelResponse) => {
    try {
        const hrAccount = await requireHRAuth(req);

        res.status(200).json({
            id: hrAccount.id,
            email: hrAccount.email,
            role: hrAccount.role,
            companyId: hrAccount.companyId,
        });
    } catch (err) {
        res.status(401).json({ message: (err as Error).message });
    }
}

export const validate = async (req: VercelRequest, res: VercelResponse) => {
    try {
        // Parse JSON body manually
        const body: any = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

        const result = emailSchema.safeParse(body.email);

        if (!result.success) {
            const validationError = fromError(result.error);
            return res.status(400).json({
                message: validationError.message || "Invalid email format. Please use your corporate email address.",
                error: validationError.toString()
            });
        }

        const email = result.data;

        console.log("start storahe");

        const user = await storage.upsertUser({
            email,
            firstName: body.firstName,
            lastName: body.lastName,
            department: body.department,
            educationLevel: body.educationLevel,
            gender: body.gender,
            age: body.age,
            workingTenure: body.workingTenure,
        });
        res.json({ user, email });
    } catch (error) {
        console.error("Error validating email:", error);
        res.status(500).json({ message: "Failed to validate email" });
    }
};

export const user = async (req: VercelRequest, res: VercelResponse) => {
    try {
        const email = validateEmail(req);

        const user = await storage.getUser(email);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
}

export const serveryResponce = async (req: VercelRequest, res: VercelResponse) => {
    try {
        const email = validateEmail(req);
        const response = await storage.getSurveyResponse(email);

        if (!response) {
            return res.json(null);
        }

        res.json(response);
    } catch (error) {
        console.error("Error fetching survey response:", error);
        res.status(500).json({ message: "Failed to fetch survey response" });
    }
}

export const serverySave = async (req: VercelRequest, res: VercelResponse) => {
    try {
        const email = validateEmail(req);

        // Extract email from body before validation (injected by queryClient)
        const { email: _, ...bodyWithoutEmail } = req.body;

        // Validate request body with Zod
        const validationResult = saveSurveySchema.safeParse(bodyWithoutEmail);
        if (!validationResult.success) {
            const validationError = fromError(validationResult.error);
            return res.status(400).json({
                message: "Invalid request data",
                error: validationError.toString()
            });
        }

        const { answers, isComplete } = validationResult.data;
        const response = await storage.saveSurveyResponse(email, answers as SurveyAnswers, isComplete);
        res.json(response);
    } catch (error) {
        console.error("Error saving survey response:", error);
        res.status(500).json({ message: "Failed to save survey response" });
    }
}

export const serverySubmit = async (req: VercelRequest, res: VercelResponse) => {
    try {
        const email = validateEmail(req);

        // Extract email from body before validation (injected by queryClient)
        const { email: _, ...bodyWithoutEmail } = req.body;

        // Validate request body with Zod - ensures all 50 questions answered
        const validationResult = submitSurveySchema.safeParse(bodyWithoutEmail);
        if (!validationResult.success) {
            const validationError = fromError(validationResult.error);
            return res.status(400).json({
                message: "Invalid or incomplete survey data",
                error: validationError.toString()
            });
        }

        const { answers } = validationResult.data;
        const response = await storage.submitSurveyResponse(email, answers as SurveyAnswers);
        res.json(response);
    } catch (error) {
        console.error("Error submitting survey response:", error);
        res.status(500).json({ message: "Failed to submit survey response" });
    }
}

export const dashboardStats = async (req: VercelRequest, res: VercelResponse) => {
    try {
        // Await the helper to get HR account
        const hrAccount = await requireHRAuth(req);

        // HR can only see their company's data, admin can see all
        const companyId = hrAccount.role === "admin" ? undefined : hrAccount.companyId;

        const stats = await storage.getSurveyStats(companyId);
        res.status(200).json(stats);
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        const message = (error as Error).message;
        const status = message.includes("not authenticated") ? 401 : 500;
        res.status(status).json({ message });
    }
};

export const dashboardSectionAverages = async (req: VercelRequest, res: VercelResponse) => {
    try {
        // Get HR account (throws if not authenticated)
        const hrAccount = await requireHRAuth(req);

        // HR can only see their company's data, admin can see all
        const companyId = hrAccount.role === "admin" ? undefined : hrAccount.companyId;

        const averages = await storage.getSectionAverages(companyId);

        res.status(200).json(averages);
    } catch (error) {
        console.error("Error fetching section averages:", error);
        const message = (error as Error).message;
        const status = message.includes("not authenticated") ? 401 : 500;
        res.status(status).json({ message });
    }
};

export const dashboardResponses = async (req: VercelRequest, res: VercelResponse) => {
    try {
        // Authenticate HR and get account
        const hrAccount = await requireHRAuth(req);

        // HR can only see their company's data, admin can see all
        const companyId = hrAccount.role === "admin" ? undefined : hrAccount.companyId;

        const responses = await storage.getAllSurveyResponses(companyId);

        res.status(200).json(responses);
    } catch (error) {
        console.error("Error fetching survey responses:", error);

        const message = (error as Error).message;
        const status = message.includes("not authenticated") ? 401 : 500;

        res.status(status).json({ message });
    }
};

export const dashboardCompanyInsights = async (req: VercelRequest, res: VercelResponse) => {
    try {
        // Authenticate HR and get the account
        const hrAccount = await requireHRAuth(req);

        // HR can only see their company's data; admin sees all
        const companyId = hrAccount.role === "admin" ? undefined : hrAccount.companyId;

        const insights = await storage.getCompanyInsights(companyId);

        res.status(200).json(insights);
    } catch (error) {
        console.error("Error fetching company insights:", error);

        const message = (error as Error).message;
        const status = message.includes("not authenticated") ? 401 : 500;

        res.status(status).json({ message });
    }
};


export const dashboardResponsesWithUsers = async (req: VercelRequest, res: VercelResponse) => {
    try {
        // Authenticate HR and get account
        const hrAccount = await requireHRAuth(req, true); // true = adminOnly

        // Only admins can view detailed responses
        if (hrAccount.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }

        const responses = await storage.getResponsesWithUsers();
        res.status(200).json(responses);
    } catch (error) {
        console.error("Error fetching responses with users:", error);

        const message = (error as Error).message;
        const status = message.includes("not authenticated") ? 401 : 500;

        res.status(status).json({ message });
    }
};

export const dashboardResponseByNumber = async (req: VercelRequest, res: VercelResponse, responseNumberParam: string) => {
    try {
        // Authenticate HR and ensure admin access
        const hrAccount = await requireHRAuth(req, true); // adminOnly = true

        // Get response number from query params
        // const responseNumberParam = req.query.responseNumber;
        const responseNumber = Array.isArray(responseNumberParam)
            ? parseInt(responseNumberParam[0])
            : parseInt(responseNumberParam as string);

        if (isNaN(responseNumber)) {
            return res.status(400).json({ message: "Invalid response number" });
        }

        const response = await storage.getResponseByNumber(responseNumber);
        if (!response) {
            return res.status(404).json({ message: "Response not found" });
        }

        res.status(200).json(response);
    } catch (error) {
        console.error("Error fetching response by number:", error);

        const message = (error as Error).message;
        const status = message.includes("not authenticated") ? 401 : 500;

        res.status(status).json({ message });
    }
};


export const dashboarWellbeingMetrics = async (req: VercelRequest, res: VercelResponse) => {
    try {
        // Authenticate HR and get account
        const hrAccount = await requireHRAuth(req);

        // HR can only see their company's data; admin sees all
        const companyId = hrAccount.role === "admin" ? undefined : hrAccount.companyId;

        const filters = {
            department: req.query.department as string | undefined,
            educationLevel: req.query.educationLevel as string | undefined,
            gender: req.query.gender as string | undefined,
            workingTenure: req.query.workingTenure as string | undefined,
            companyDomain: req.query.companyDomain as string | undefined,
            companyId,
        };

        const metrics = await storage.getWellbeingMetrics(filters);
        res.status(200).json(metrics);
    } catch (error) {
        console.error("Error fetching wellbeing metrics:", error);

        const message = (error as Error).message;
        const status = message.includes("not authenticated") ? 401 : 500;

        res.status(status).json({ message });
    }
};


export const dashboardDemographicBreakdown = async (req: VercelRequest, res: VercelResponse) => {
    try {
        // Authenticate HR and get account
        const hrAccount = await requireHRAuth(req);

        // HR can only see their company's data; admin sees all
        const companyId = hrAccount.role === "admin" ? undefined : hrAccount.companyId;

        const breakdown = await storage.getDemographicBreakdown(companyId);
        res.status(200).json(breakdown);
    } catch (error) {
        console.error("Error fetching demographic breakdown:", error);

        const message = (error as Error).message;
        const status = message.includes("not authenticated") ? 401 : 500;

        res.status(status).json({ message });
    }
};


export const dashboardHrAccounts = async (req: VercelRequest, res: VercelResponse) => {
    try {
        // Authenticate HR and ensure admin access
        const hrAccount = await requireHRAuth(req, true); // adminOnly = true

        // Only admins can view all HR accounts
        if (hrAccount.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }

        const accounts = await storage.getAllHRAccounts();

        // Remove sensitive data before sending
        const sanitized = accounts.map(({ passwordHash, ...account }) => ({
            ...account,
        }));

        res.status(200).json(sanitized);
    } catch (error) {
        console.error("Error fetching HR accounts:", error);

        const message = (error as Error).message;
        const status = message.includes("not authenticated") ? 401 : 500;

        res.status(status).json({ message });
    }
};

export const dashboardExportCsv = async (req: VercelRequest, res: VercelResponse) => {
    try {
        // Authenticate HR and ensure admin-only access
        const hrAccount = await requireHRAuth(req, true); // adminOnly = true

        // Fetch all responses with user details
        const responses = await storage.getResponsesWithUsers();

        // Build CSV header
        let csv = "Response Number,Email,First Name,Last Name,Department,Education Level,Gender,Working Tenure,Completed At,Section A Avg,Section B Avg,Section C Avg,Section D Avg,Section E Avg\n";

        // Helper to map answers to numeric values
        const answerValues: Record<string, number> = {
            'strongly_disagree': 1,
            'disagree': 2,
            'neutral': 3,
            'agree': 4,
            'strongly_agree': 5,
        };

        const escapeCsv = (val: string | null | undefined) => {
            if (!val) return "";
            return `"${val.replace(/"/g, '""')}"`;
        };

        responses.forEach(response => {
            const answers = response.answers as SurveyAnswers;

            const calcSectionAvg = (start: number, end: number) => {
                let sum = 0, count = 0;
                for (let i = start; i <= end; i++) {
                    const ans = answers[i.toString()];
                    if (ans) {
                        sum += answerValues[ans] || 0;
                        count++;
                    }
                }
                return count > 0 ? (sum / count).toFixed(2) : "0";
            };

            const sectionA = calcSectionAvg(1, 10);
            const sectionB = calcSectionAvg(11, 20);
            const sectionC = calcSectionAvg(21, 30);
            const sectionD = calcSectionAvg(31, 40);
            const sectionE = calcSectionAvg(41, 50);

            csv += [
                response.responseNumber,
                escapeCsv(response.user.email),
                escapeCsv(response.user.firstName),
                escapeCsv(response.user.lastName),
                escapeCsv(response.user.department),
                escapeCsv(response.user.educationLevel),
                escapeCsv(response.user.gender),
                escapeCsv(response.user.workingTenure),
                response.completedAt?.toISOString() || "",
                sectionA,
                sectionB,
                sectionC,
                sectionD,
                sectionE
            ].join(",") + "\n";
        });

        // Set headers for CSV download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="survey-responses-${new Date().toISOString().split('T')[0]}.csv"`);

        res.status(200).send(csv);

    } catch (error) {
        console.error("Error exporting CSV:", error);

        const message = (error as Error).message;
        const status = message.includes("not authenticated") ? 401 :
            message.includes("Admin access required") ? 403 : 500;

        res.status(status).json({ message });
    }
};

export const adminGetCompanies = async (req: VercelRequest, res: VercelResponse) => {
    try {
        // Authenticate HR and enforce admin-only access
        const hrAccount = await requireHRAuth(req, true); // adminOnly = true

        // Fetch all companies
        const companies = await storage.getAllCompanies();

        res.status(200).json(companies);
    } catch (error) {
        console.error("Error fetching companies:", error);

        const message = (error as Error).message;
        const status = message.includes("not authenticated") ? 401 :
            message.includes("Admin access required") ? 403 : 500;

        res.status(status).json({ message });
    }
};

export const adminGetEmployees = async (req: VercelRequest, res: VercelResponse) => {
    try {
        // Authenticate HR and enforce admin-only access
        const hrAccount = await requireHRAuth(req, true); // adminOnly = true

        // Parse optional companyId query parameter
        const companyId = req.query.companyId ? parseInt(req.query.companyId as string) : undefined;

        // Fetch employees (all or by companyId)
        const employees = await storage.getAllEmployees(companyId);

        res.status(200).json(employees);
    } catch (error) {
        console.error("Error fetching employees:", error);

        const message = (error as Error).message;
        const status = message.includes("not authenticated") ? 401 :
            message.includes("Admin access required") ? 403 : 500;

        res.status(status).json({ message });
    }
};


export const adminCreateCertification = async (req: VercelRequest, res: VercelResponse) => {
    try {
        // Authenticate HR and enforce admin-only access
        const hrAccount = await requireHRAuth(req, true); // adminOnly = true

        const { companyId, title, description, validUntil } = req.body;

        if (!companyId || !title) {
            return res.status(400).json({ message: "Company ID and title are required" });
        }

        // Generate unique certificate number
        const certificateNumber = `CERT-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)
            .toUpperCase()}`;

        const certification = await storage.createCertification({
            companyId,
            certificateNumber,
            issuedBy: hrAccount.id,
            title,
            description,
            validUntil: validUntil ? new Date(validUntil) : undefined,
        });

        res.status(200).json(certification);
    } catch (error) {
        console.error("Error creating certification:", error);

        const message = (error as Error).message;
        const status = message.includes("not authenticated") ? 401 :
            message.includes("Admin access required") ? 403 : 500;

        res.status(status).json({ message });
    }
};



export const adminGetCertifications = async (req: VercelRequest, res: VercelResponse) => {
    try {
        // Authenticate HR and enforce admin-only access
        const hrAccount = await requireHRAuth(req, true); // adminOnly = true

        const companyId = req.query.companyId ? parseInt(req.query.companyId as string) : undefined;
        const certifications = await storage.getAllCertifications(companyId);

        res.status(200).json(certifications);
    } catch (error) {
        console.error("Error fetching certifications:", error);

        const message = (error as Error).message;
        const status = message.includes("not authenticated") ? 401 :
            message.includes("Admin access required") ? 403 : 500;

        res.status(status).json({ message });
    }
};


export const adminRevokeCertification = async (req: VercelRequest, res: VercelResponse, id: number) => {
    try {
        // Only allow PATCH requests
        if (req.method !== "PATCH") {
            return res.status(405).json({ message: "Method not allowed" });
        }

        // Authenticate HR and enforce admin-only access
        const hrAccount = await requireHRAuth(req, true); // adminOnly = true
        if (hrAccount?.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }



        await storage.revokeCertification(id);

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error revoking certification:", error);

        const message = (error as Error).message;
        const status = message.includes("not authenticated") ? 401 :
            message.includes("Admin access required") ? 403 : 500;

        res.status(status).json({ message });
    }
};