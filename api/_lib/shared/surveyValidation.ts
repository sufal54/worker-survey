import { z } from "zod";

// Valid survey answer values
export const surveyAnswerSchema = z.enum([
  "strongly_disagree",
  "disagree", 
  "neutral",
  "agree",
  "strongly_agree"
]);

// Survey answers object - maps question ID (1-50) to answer
export const surveyAnswersSchema = z.record(
  z.string().regex(/^(?:[1-9]|[1-4][0-9]|50)$/), // Question IDs 1-50 (exact match)
  surveyAnswerSchema
);

// Save survey request
export const saveSurveySchema = z.object({
  answers: surveyAnswersSchema,
  isComplete: z.boolean().default(false),
});

// Submit survey request - requires all 50 answers
export const submitSurveySchema = z.object({
  answers: surveyAnswersSchema.refine(
    (answers) => Object.keys(answers).length === 50,
    { message: "All 50 questions must be answered" }
  ),
});

export type SaveSurveyRequest = z.infer<typeof saveSurveySchema>;
export type SubmitSurveyRequest = z.infer<typeof submitSurveySchema>;
