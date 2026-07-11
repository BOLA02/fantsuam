import { z, ZodError } from "zod"; // 🟢 Import the raw z namespace
import { Request, Response, NextFunction } from "express";

export const validate =
  (schema: z.ZodType) => // 🟢 FIXED: Using z.ZodType directly (no deprecation warnings)
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
          errors: error.flatten().fieldErrors, // Returns clear field-specific errors
        });
      }

      next(error);
    }
  };
