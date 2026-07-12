// src/modules/resume/resume.controller.ts
// NEW FILE

import { Request, Response, NextFunction } from "express";
import resumeService from "./resume.service";

export async function getResumeState(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.query as { token?: string };
    if (!token) {
      return res.status(400).json({ error: "Missing resume token" });
    }
    const result = await resumeService.getStateFromToken(token);
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
}