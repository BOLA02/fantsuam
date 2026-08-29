import { z, ZodError } from "zod"; 
import { Request, Response, NextFunction } from "express";

export const validate =
  (schema: z.ZodType) => 
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.flatten().fieldErrors, 
        });
      }

      next(error);
    }
  };
