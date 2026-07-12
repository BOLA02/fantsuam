// src/modules/resume/resume.routes.ts
// NEW FILE — mount in your root router (e.g. app.use('/api/resume', resumeRoutes))

import { Router } from "express";
import { getResumeState } from "./resume.controller";

const router = Router();

router.get("/", getResumeState);

export default router;