"use strict";
// src/modules/resume/resume.routes.ts
// NEW FILE — mount in your root router (e.g. app.use('/api/resume', resumeRoutes))
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const resume_controller_1 = require("./resume.controller");
const router = (0, express_1.Router)();
router.get("/", resume_controller_1.getResumeState);
exports.default = router;
