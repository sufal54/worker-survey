import {
  users,
  surveyResponses,
  companies,
  hrAccounts,
  sessions,
  certifications,
  type User,
  type UpsertUser,
  type SurveyResponse,
  type InsertSurveyResponse,
  type SurveyAnswers,
  type Company,
  type HRAccount,
  type Session,
  type Certification,
  type InsertCertification,
} from "./shared/schema.js";
import { db } from "./db.js";
import { eq, desc, count, sql, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Helper function to extract company domain from email
function extractCompanyDomain(email: string): string {
  return email.toLowerCase().split('@')[1];
}

// Helper function to extract company name from domain
function extractCompanyName(domain: string): string {
  return domain.split('.')[0];
}

export interface IStorage {
  // User operations
  getUser(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Company operations
  getCompanyByDomain(domain: string): Promise<Company | undefined>;
  createCompany(domain: string, name: string): Promise<Company>;

  // HR Account operations
  getHRAccountByEmail(email: string): Promise<HRAccount | undefined>;
  getHRAccountById(id: number): Promise<HRAccount | undefined>;
  createHRAccount(companyId: number, email: string, password: string, role?: string): Promise<HRAccount>;
  validateHRCredentials(email: string, password: string): Promise<HRAccount | null>;
  updateLastLogin(id: number): Promise<void>;
  getAllHRAccounts(): Promise<Array<HRAccount & { company: Company }>>;

  // Session operations
  createSession(hrAccountId: number): Promise<Session>;
  getSession(token: string): Promise<Session | undefined>;
  deleteSession(token: string): Promise<void>;
  cleanExpiredSessions(): Promise<void>;

  // Survey operations
  getSurveyResponse(userEmail: string): Promise<SurveyResponse | undefined>;
  getResponseByNumber(responseNumber: number): Promise<(SurveyResponse & { user: User }) | undefined>;
  saveSurveyResponse(userEmail: string, answers: SurveyAnswers, isComplete: boolean): Promise<SurveyResponse>;
  submitSurveyResponse(userEmail: string, answers: SurveyAnswers): Promise<SurveyResponse>;

  // Dashboard operations (with optional company filtering)
  getAllSurveyResponses(companyId?: number): Promise<SurveyResponse[]>;
  getSurveyStats(companyId?: number): Promise<{
    totalResponses: number;
    completedResponses: number;
    inProgressResponses: number;
  }>;
  getSectionAverages(companyId?: number): Promise<{
    sectionA: number;
    sectionB: number;
    sectionC: number;
    sectionD: number;
    sectionE: number;
  }>;
  getCompanyInsights(companyId?: number): Promise<Array<{
    companyDomain: string;
    companyName: string;
    totalResponses: number;
    completedResponses: number;
    averageScore: number;
  }>>;
  getResponsesWithUsers(companyId?: number): Promise<Array<SurveyResponse & { user: User }>>;
  getWellbeingMetrics(filters?: {
    department?: string;
    educationLevel?: string;
    gender?: string;
    workingTenure?: string;
    companyDomain?: string;
    companyId?: number;
  }): Promise<{
    successScore: number;
    prideIndex: number;
    happinessLevel: number;
    overallSatisfaction: number;
  }>;
  getDemographicBreakdown(companyId?: number): Promise<{
    departments: Array<{ name: string; count: number }>;
    educationLevels: Array<{ name: string; count: number }>;
    genders: Array<{ name: string; count: number }>;
    tenures: Array<{ name: string; count: number }>;
  }>;

  // Certification operations
  createCertification(data: InsertCertification): Promise<Certification>;
  getAllCertifications(companyId?: number): Promise<Array<Certification & { company: Company; issuedByAccount: HRAccount }>>;
  getCertificationById(id: number): Promise<(Certification & { company: Company; issuedByAccount: HRAccount }) | undefined>;
  revokeCertification(id: number): Promise<void>;

  // Company operations for admin
  getAllCompanies(): Promise<Company[]>;
  getAllEmployees(companyId?: number): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  // Company operations
  async getCompanyByDomain(domain: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.domain, domain));
    return company;
  }

  async createCompany(domain: string, name: string): Promise<Company> {
    const existing = await this.getCompanyByDomain(domain);
    if (existing) return existing;

    const [company] = await db
      .insert(companies)
      .values({ domain, name, hrEmail: `hr@${domain}` })
      .returning();
    return company;
  }

  // HR Account operations
  async getHRAccountByEmail(email: string): Promise<HRAccount | undefined> {
    const [account] = await db.select().from(hrAccounts).where(eq(hrAccounts.email, email));
    return account;
  }

  async getHRAccountById(id: number): Promise<HRAccount | undefined> {
    const [account] = await db.select().from(hrAccounts).where(eq(hrAccounts.id, id));
    return account;
  }

  async createHRAccount(companyId: number, email: string, password: string, role: string = "hr"): Promise<HRAccount> {
    const passwordHash = await bcrypt.hash(password, 10);
    const [account] = await db
      .insert(hrAccounts)
      .values({
        companyId,
        email,
        passwordHash,
        role,
        mustResetPassword: true,
      })
      .returning();
    return account;
  }

  async validateHRCredentials(email: string, password: string): Promise<HRAccount | null> {
    const account = await this.getHRAccountByEmail(email);
    if (!account) return null;

    const isValid = await bcrypt.compare(password, account.passwordHash);
    return isValid ? account : null;
  }

  async updateLastLogin(id: number): Promise<void> {
    await db
      .update(hrAccounts)
      .set({ lastLogin: new Date() })
      .where(eq(hrAccounts.id, id));
  }

  async getAllHRAccounts(): Promise<Array<HRAccount & { company: Company }>> {
    const accounts = await db
      .select({
        hrAccount: hrAccounts,
        company: companies,
      })
      .from(hrAccounts)
      .leftJoin(companies, eq(hrAccounts.companyId, companies.id))
      .orderBy(desc(hrAccounts.createdAt));

    return accounts.map(row => ({
      ...row.hrAccount,
      company: row.company!,
    }));
  }

  // Session operations
  async createSession(hrAccountId: number): Promise<Session> {
    const token = Buffer.from(`${hrAccountId}-${Date.now()}-${Math.random()}`).toString('base64');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const [session] = await db
      .insert(sessions)
      .values({
        hrAccountId,
        token,
        expiresAt,
      })
      .returning();
    return session;
  }

  async getSession(token: string): Promise<Session | undefined> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(and(
        eq(sessions.token, token),
        sql`${sessions.expiresAt} > NOW()`
      ));
    return session;
  }

  async deleteSession(token: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  async cleanExpiredSessions(): Promise<void> {
    await db.delete(sessions).where(sql`${sessions.expiresAt} <= NOW()`);
  }

  // User operations
  async getUser(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const companyDomain = extractCompanyDomain(userData.email);
    const companyName = extractCompanyName(companyDomain);

    // Ensure company exists
    let company = await this.getCompanyByDomain(companyDomain);
    if (!company) {
      company = await this.createCompany(companyDomain, companyName);
    }

    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        company: companyName,
        companyId: company.id,
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          ...userData,
          company: companyName,
          companyId: company.id,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Survey operations
  async getSurveyResponse(userEmail: string): Promise<SurveyResponse | undefined> {
    const [response] = await db
      .select()
      .from(surveyResponses)
      .where(eq(surveyResponses.userEmail, userEmail));
    return response;
  }

  async saveSurveyResponse(userEmail: string, answers: SurveyAnswers, isComplete: boolean): Promise<SurveyResponse> {
    const existing = await this.getSurveyResponse(userEmail);
    const companyDomain = extractCompanyDomain(userEmail);
    const company = await this.getCompanyByDomain(companyDomain);

    if (existing) {
      // Merge new answers with existing ones to preserve progress
      const mergedAnswers = { ...existing.answers as SurveyAnswers, ...answers };

      const [updated] = await db
        .update(surveyResponses)
        .set({
          answers: mergedAnswers,
          isComplete,
          companyDomain: existing.companyDomain || companyDomain,
          companyId: existing.companyId || company?.id,
          updatedAt: new Date(),
        })
        .where(eq(surveyResponses.userEmail, userEmail))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(surveyResponses)
        .values({
          userEmail,
          answers,
          isComplete,
          companyDomain,
          companyId: company?.id,
        })
        .returning();
      return created;
    }
  }

  async submitSurveyResponse(userEmail: string, answers: SurveyAnswers): Promise<SurveyResponse> {
    const existing = await this.getSurveyResponse(userEmail);
    const companyDomain = extractCompanyDomain(userEmail);
    const company = await this.getCompanyByDomain(companyDomain);

    if (existing) {
      const [updated] = await db
        .update(surveyResponses)
        .set({
          answers,
          isComplete: true,
          companyDomain: existing.companyDomain || companyDomain,
          companyId: existing.companyId || company?.id,
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(surveyResponses.userEmail, userEmail))
        .returning();

      // Auto-create HR account when first survey is completed
      if (company) {
        const hrEmail = `hr@${companyDomain}`;
        const existingHR = await this.getHRAccountByEmail(hrEmail);
        if (!existingHR) {
          await this.createHRAccount(company.id, hrEmail, "12345678");
        }
      }

      return updated;
    } else {
      const [created] = await db
        .insert(surveyResponses)
        .values({
          userEmail,
          answers,
          isComplete: true,
          companyDomain,
          companyId: company?.id,
          completedAt: new Date(),
        })
        .returning();

      // Auto-create HR account when first survey is completed
      if (company) {
        const hrEmail = `hr@${companyDomain}`;
        const existingHR = await this.getHRAccountByEmail(hrEmail);
        if (!existingHR) {
          await this.createHRAccount(company.id, hrEmail, "12345678");
        }
      }

      return created;
    }
  }

  // Dashboard operations
  async getAllSurveyResponses(companyId?: number): Promise<SurveyResponse[]> {
    const whereConditions = companyId
      ? and(eq(surveyResponses.isComplete, true), eq(surveyResponses.companyId, companyId))
      : eq(surveyResponses.isComplete, true);

    return await db
      .select()
      .from(surveyResponses)
      .where(whereConditions)
      .orderBy(desc(surveyResponses.completedAt));
  }

  async getSurveyStats(companyId?: number): Promise<{
    totalResponses: number;
    completedResponses: number;
    inProgressResponses: number;
  }> {
    const totalWhere = companyId ? eq(surveyResponses.companyId, companyId) : undefined;
    const completedWhere = companyId
      ? and(eq(surveyResponses.isComplete, true), eq(surveyResponses.companyId, companyId))
      : eq(surveyResponses.isComplete, true);

    const [total] = await db
      .select({ count: count() })
      .from(surveyResponses)
      .where(totalWhere);

    const [completed] = await db
      .select({ count: count() })
      .from(surveyResponses)
      .where(completedWhere);

    return {
      totalResponses: total.count,
      completedResponses: completed.count,
      inProgressResponses: total.count - completed.count,
    };
  }

  async getSectionAverages(companyId?: number): Promise<{
    sectionA: number;
    sectionB: number;
    sectionC: number;
    sectionD: number;
    sectionE: number;
  }> {
    const responses = await this.getAllSurveyResponses(companyId);

    if (responses.length === 0) {
      return {
        sectionA: 0,
        sectionB: 0,
        sectionC: 0,
        sectionD: 0,
        sectionE: 0,
      };
    }

    // Calculate section averages
    const calculateSectionAverage = (responses: SurveyResponse[], startQ: number, endQ: number): number => {
      const answerValues = {
        'strongly_disagree': 1,
        'disagree': 2,
        'neutral': 3,
        'agree': 4,
        'strongly_agree': 5,
      };

      let totalScore = 0;
      let totalQuestions = 0;

      responses.forEach(response => {
        const answers = response.answers as SurveyAnswers;
        for (let q = startQ; q <= endQ; q++) {
          const answer = answers[q.toString()];
          if (answer) {
            totalScore += answerValues[answer];
            totalQuestions++;
          }
        }
      });

      return totalQuestions > 0 ? totalScore / totalQuestions : 0;
    };

    return {
      sectionA: calculateSectionAverage(responses, 1, 10),
      sectionB: calculateSectionAverage(responses, 11, 20),
      sectionC: calculateSectionAverage(responses, 21, 30),
      sectionD: calculateSectionAverage(responses, 31, 40),
      sectionE: calculateSectionAverage(responses, 41, 50),
    };
  }

  async getResponseByNumber(responseNumber: number): Promise<(SurveyResponse & { user: User }) | undefined> {
    const [response] = await db
      .select()
      .from(surveyResponses)
      .leftJoin(users, eq(surveyResponses.userEmail, users.email))
      .where(eq(surveyResponses.responseNumber, responseNumber));

    if (!response || !response.users) return undefined;

    return {
      ...response.survey_responses,
      user: response.users,
    };
  }

  async getResponsesWithUsers(companyId?: number): Promise<Array<SurveyResponse & { user: User }>> {
    const whereConditions = companyId
      ? and(eq(surveyResponses.isComplete, true), eq(surveyResponses.companyId, companyId))
      : eq(surveyResponses.isComplete, true);

    const results = await db
      .select()
      .from(surveyResponses)
      .leftJoin(users, eq(surveyResponses.userEmail, users.email))
      .where(whereConditions)
      .orderBy(desc(surveyResponses.completedAt));

    return results
      .filter(r => r.users !== null)
      .map(r => ({
        ...r.survey_responses,
        user: r.users!,
      }));
  }

  async getCompanyInsights(companyId?: number): Promise<Array<{
    companyDomain: string;
    companyName: string;
    totalResponses: number;
    completedResponses: number;
    averageScore: number;
  }>> {
    const whereCondition = companyId ? eq(surveyResponses.companyId, companyId) : undefined;

    const responses = await db
      .select()
      .from(surveyResponses)
      .where(whereCondition)
      .orderBy(surveyResponses.companyDomain);

    const companyMap = new Map<string, {
      total: number;
      completed: number;
      totalScore: number;
      scoreCount: number;
    }>();

    responses.forEach(response => {
      const domain = response.companyDomain || 'unknown';
      if (!companyMap.has(domain)) {
        companyMap.set(domain, { total: 0, completed: 0, totalScore: 0, scoreCount: 0 });
      }

      const stats = companyMap.get(domain)!;
      stats.total++;

      if (response.isComplete) {
        stats.completed++;

        const answerValues = {
          'strongly_disagree': 1,
          'disagree': 2,
          'neutral': 3,
          'agree': 4,
          'strongly_agree': 5,
        };

        const answers = response.answers as SurveyAnswers;
        Object.values(answers).forEach((answer) => {
          if (answer in answerValues) {
            stats.totalScore += answerValues[answer as keyof typeof answerValues];
            stats.scoreCount++;
          }
        });
      }
    });

    return Array.from(companyMap.entries()).map(([domain, stats]) => ({
      companyDomain: domain,
      companyName: extractCompanyName(domain),
      totalResponses: stats.total,
      completedResponses: stats.completed,
      averageScore: stats.scoreCount > 0 ? stats.totalScore / stats.scoreCount : 0,
    }));
  }

  async getWellbeingMetrics(filters?: {
    department?: string;
    educationLevel?: string;
    gender?: string;
    workingTenure?: string;
    companyDomain?: string;
    companyId?: number;
  }): Promise<{
    successScore: number;
    prideIndex: number;
    happinessLevel: number;
    overallSatisfaction: number;
  }> {
    // Build query with filters
    let query = db
      .select()
      .from(surveyResponses)
      .leftJoin(users, eq(surveyResponses.userEmail, users.email))
      .where(eq(surveyResponses.isComplete, true));

    // Apply filters if provided
    let responses = await query;

    if (filters) {
      responses = responses.filter(r => {
        if (!r.users) return false;
        if (filters.department && r.users.department !== filters.department) return false;
        if (filters.educationLevel && r.users.educationLevel !== filters.educationLevel) return false;
        if (filters.gender && r.users.gender !== filters.gender) return false;
        if (filters.workingTenure && r.users.workingTenure !== filters.workingTenure) return false;
        if (filters.companyDomain && r.survey_responses.companyDomain !== filters.companyDomain) return false;
        if (filters.companyId && r.survey_responses.companyId !== filters.companyId) return false;
        return true;
      });
    }

    if (responses.length === 0) {
      return {
        successScore: 0,
        prideIndex: 0,
        happinessLevel: 0,
        overallSatisfaction: 0,
      };
    }

    const answerValues = {
      'strongly_disagree': 1,
      'disagree': 2,
      'neutral': 3,
      'agree': 4,
      'strongly_agree': 5,
    };

    const calculateScore = (questionNumbers: number[]): number => {
      let totalScore = 0;
      let count = 0;

      responses.forEach(r => {
        const answers = r.survey_responses.answers as SurveyAnswers;
        questionNumbers.forEach(qNum => {
          const answer = answers[qNum.toString()];
          if (answer && answer in answerValues) {
            totalScore += answerValues[answer as keyof typeof answerValues];
            count++;
          }
        });
      });

      return count > 0 ? totalScore / count : 0;
    };

    // Success Score: Leadership & Vision (1-10) + Growth & Recognition (31-40)
    const successQuestions = Array.from({ length: 10 }, (_, i) => i + 1).concat(Array.from({ length: 10 }, (_, i) => i + 31));
    const successScore = calculateScore(successQuestions);

    // Pride Index: Culture & Communication (21-30) + Inclusion & Trust (41-50)
    const prideQuestions = Array.from({ length: 10 }, (_, i) => i + 21).concat(Array.from({ length: 10 }, (_, i) => i + 41));
    const prideIndex = calculateScore(prideQuestions);

    // Happiness Level: Employee Wellbeing & Happiness (11-20)
    const happinessQuestions = Array.from({ length: 10 }, (_, i) => i + 11);
    const happinessLevel = calculateScore(happinessQuestions);

    // Overall Satisfaction: All 50 questions
    const allQuestions = Array.from({ length: 50 }, (_, i) => i + 1);
    const overallSatisfaction = calculateScore(allQuestions);

    return {
      successScore,
      prideIndex,
      happinessLevel,
      overallSatisfaction,
    };
  }

  async getDemographicBreakdown(companyId?: number): Promise<{
    departments: Array<{ name: string; count: number }>;
    educationLevels: Array<{ name: string; count: number }>;
    genders: Array<{ name: string; count: number }>;
    tenures: Array<{ name: string; count: number }>;
  }> {
    const whereConditions = companyId
      ? and(eq(surveyResponses.isComplete, true), eq(surveyResponses.companyId, companyId))
      : eq(surveyResponses.isComplete, true);

    const allUsers = await db
      .select()
      .from(users)
      .leftJoin(surveyResponses, eq(users.email, surveyResponses.userEmail))
      .where(whereConditions);

    const departments = new Map<string, number>();
    const educationLevels = new Map<string, number>();
    const genders = new Map<string, number>();
    const tenures = new Map<string, number>();

    allUsers.forEach(({ users: user }) => {
      if (user) {
        if (user.department) {
          departments.set(user.department, (departments.get(user.department) || 0) + 1);
        }
        if (user.educationLevel) {
          educationLevels.set(user.educationLevel, (educationLevels.get(user.educationLevel) || 0) + 1);
        }
        if (user.gender) {
          genders.set(user.gender, (genders.get(user.gender) || 0) + 1);
        }
        if (user.workingTenure) {
          tenures.set(user.workingTenure, (tenures.get(user.workingTenure) || 0) + 1);
        }
      }
    });

    return {
      departments: Array.from(departments.entries()).map(([name, count]) => ({ name, count })),
      educationLevels: Array.from(educationLevels.entries()).map(([name, count]) => ({ name, count })),
      genders: Array.from(genders.entries()).map(([name, count]) => ({ name, count })),
      tenures: Array.from(tenures.entries()).map(([name, count]) => ({ name, count })),
    };
  }

  // Certification operations
  async createCertification(data: InsertCertification): Promise<Certification> {
    const [certification] = await db
      .insert(certifications)
      .values(data)
      .returning();
    return certification;
  }

  async getAllCertifications(companyId?: number): Promise<Array<Certification & { company: Company; issuedByAccount: HRAccount }>> {
    const whereCondition = companyId ? eq(certifications.companyId, companyId) : undefined;

    const results = await db
      .select()
      .from(certifications)
      .leftJoin(companies, eq(certifications.companyId, companies.id))
      .leftJoin(hrAccounts, eq(certifications.issuedBy, hrAccounts.id))
      .where(whereCondition)
      .orderBy(desc(certifications.createdAt));

    return results.map(row => ({
      ...row.certifications,
      company: row.companies!,
      issuedByAccount: row.hr_accounts!,
    }));
  }

  async getCertificationById(id: number): Promise<(Certification & { company: Company; issuedByAccount: HRAccount }) | undefined> {
    const [result] = await db
      .select()
      .from(certifications)
      .leftJoin(companies, eq(certifications.companyId, companies.id))
      .leftJoin(hrAccounts, eq(certifications.issuedBy, hrAccounts.id))
      .where(eq(certifications.id, id));

    if (!result || !result.companies || !result.hr_accounts) return undefined;

    return {
      ...result.certifications,
      company: result.companies,
      issuedByAccount: result.hr_accounts,
    };
  }

  async revokeCertification(id: number): Promise<void> {
    await db
      .update(certifications)
      .set({ status: 'revoked', updatedAt: new Date() })
      .where(eq(certifications.id, id));
  }

  // Company operations for admin
  async getAllCompanies(): Promise<Company[]> {
    return await db.select().from(companies).orderBy(desc(companies.createdAt));
  }

  async getAllEmployees(companyId?: number): Promise<User[]> {
    const whereCondition = companyId ? eq(users.companyId, companyId) : undefined;
    return await db
      .select()
      .from(users)
      .where(whereCondition)
      .orderBy(desc(users.createdAt));
  }
}

export const storage = new DatabaseStorage();
