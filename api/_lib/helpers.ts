import type { VercelRequest, VercelResponse } from '@vercel/node';
import { emailSchema } from '../../shared/schema';
import { fromError } from 'zod-validation-error';

export function getEmailFromRequest(req: VercelRequest): string | null {
  const email = req.body?.email || req.query?.email;
  
  if (!email) {
    return null;
  }

  const result = emailSchema.safeParse(email);
  if (!result.success) {
    return null;
  }

  return result.data;
}

export function validateEmail(req: VercelRequest, res: VercelResponse): string | null {
  const email = getEmailFromRequest(req);
  
  if (!email) {
    res.status(400).json({ message: "Email is required" });
    return null;
  }

  const result = emailSchema.safeParse(email);
  if (!result.success) {
    const validationError = fromError(result.error);
    res.status(400).json({ 
      message: "Invalid email", 
      error: validationError.toString() 
    });
    return null;
  }

  return result.data;
}

export function handleError(error: unknown, res: VercelResponse, message: string) {
  console.error(message, error);
  res.status(500).json({ message });
}
