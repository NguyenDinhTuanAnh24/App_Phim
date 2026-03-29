import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validate = (schema: ZodSchema) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error: any) {
      if (error instanceof ZodError || error?.name === 'ZodError') {
        const formatErrors = error.errors?.map((err: any) => ({
          field: err.path?.join('.'),
          message: err.message
        })) || [];
        res.status(400).json({ success: false, errors: formatErrors });
      } else {
        next(error);
      }
    }
  };
