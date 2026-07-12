"use strict";
// src/modules/resume/resume.controller.ts
// NEW FILE
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResumeState = getResumeState;
const resume_service_1 = __importDefault(require("./resume.service"));
async function getResumeState(req, res, next) {
    try {
        const { token } = req.query;
        if (!token) {
            return res.status(400).json({ error: "Missing resume token" });
        }
        const result = await resume_service_1.default.getStateFromToken(token);
        res.status(200).json({ data: result });
    }
    catch (err) {
        next(err);
    }
}
