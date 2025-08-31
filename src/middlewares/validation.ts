import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error: any) {
      console.error('Validation error:', error.issues);
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.issues.length ? error.issues[0].message : 'Invalid request data'
      });
    }
  };
};

export const validateParams = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.params);
      Object.assign(req.params, validatedData);
      next();
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: 'Invalid parameters',
        details: error.issues.length ? error.issues[0].message : 'Invalid request parameters'
      });
    }
  };
}; 