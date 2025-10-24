import { sql } from 'drizzle-orm';
import {
  jsonb,
  pgTable,
  timestamp,
  varchar,
  boolean,
  serial,
  integer,
  text,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Companies table for multi-tenant organization
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  domain: varchar("domain").unique().notNull(),
  name: varchar("name").notNull(),
  hrEmail: varchar("hr_email"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// HR accounts table for company HR access
export const hrAccounts = pgTable("hr_accounts", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  email: varchar("email").unique().notNull(),
  passwordHash: varchar("password_hash").notNull(),
  role: varchar("role").notNull().default("hr"), // 'hr' or 'admin'
  lastLogin: timestamp("last_login"),
  mustResetPassword: boolean("must_reset_password").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sessions table for authentication
export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hrAccountId: integer("hr_account_id").notNull().references(() => hrAccounts.id),
  token: varchar("token").unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User table with demographic information for analytics
export const users = pgTable("users", {
  email: varchar("email").primaryKey(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  company: varchar("company"),
  department: varchar("department"),
  educationLevel: varchar("education_level"),
  gender: varchar("gender"),
  workingTenure: varchar("working_tenure"),
  companyId: integer("company_id").references(() => companies.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Survey responses table
export const surveyResponses = pgTable("survey_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  responseNumber: serial("response_number"),
  userEmail: varchar("user_email").notNull().references(() => users.email),
  companyId: integer("company_id").references(() => companies.id),
  companyDomain: varchar("company_domain"),
  // Store all 50 answers as JSON object: { "1": "strongly_agree", "2": "agree", ... }
  answers: jsonb("answers").notNull(),
  isComplete: boolean("is_complete").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Certifications table for admin to issue certifications to companies
export const certifications = pgTable("certifications", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  certificateNumber: varchar("certificate_number").unique().notNull(),
  issuedBy: integer("issued_by").notNull().references(() => hrAccounts.id),
  title: varchar("title").notNull(),
  description: text("description"),
  validFrom: timestamp("valid_from").notNull().defaultNow(),
  validUntil: timestamp("valid_until"),
  status: varchar("status").notNull().default("active"), // 'active', 'revoked', 'expired'
  metadata: jsonb("metadata"), // Additional certification data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod schemas
export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

export type HRAccount = typeof hrAccounts.$inferSelect;
export type InsertHRAccount = typeof hrAccounts.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type SurveyResponse = typeof surveyResponses.$inferSelect;

export const insertSurveyResponseSchema = createInsertSchema(surveyResponses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSurveyResponse = z.infer<typeof insertSurveyResponseSchema>;

export type Certification = typeof certifications.$inferSelect;
export const insertCertificationSchema = createInsertSchema(certifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCertification = z.infer<typeof insertCertificationSchema>;

// Login schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Survey answer type
export type SurveyAnswer = "strongly_disagree" | "disagree" | "neutral" | "agree" | "strongly_agree";

// Survey answers object type (question number -> answer)
export type SurveyAnswers = Record<string, SurveyAnswer>;

// Email validation schema for corporate emails
export const emailSchema = z.string().email().refine(
  (email) => {
    const freeEmailDomains = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
      'icloud.com', 'mail.com', 'aol.com', 'protonmail.com'
    ];
    const domain = email.toLowerCase().split('@')[1];
    return !freeEmailDomains.includes(domain);
  },
  { message: "Please use your corporate email address" }
);

// Demographic options for segmentation and filtering
export const DEPARTMENTS = [
  'Human Resources',
  'Finance',
  'Engineering',
  'Sales',
  'Marketing',
  'Operations',
  'Customer Support',
  'Product',
  'Legal',
  'Other'
] as const;

export const EDUCATION_LEVELS = [
  'High School',
  'Associate Degree',
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'Doctoral Degree',
  'Other'
] as const;

export const GENDERS = [
  'Male',
  'Female',
  'Non-binary',
  'Prefer not to say'
] as const;

export const WORKING_TENURES = [
  'Less than 1 year',
  '1-2 years',
  '3-5 years',
  '6-10 years',
  'More than 10 years'
] as const;

export type Department = typeof DEPARTMENTS[number];
export type EducationLevel = typeof EDUCATION_LEVELS[number];
export type Gender = typeof GENDERS[number];
export type WorkingTenure = typeof WORKING_TENURES[number];
