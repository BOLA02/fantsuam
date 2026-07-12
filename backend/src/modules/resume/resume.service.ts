// src/modules/resume/resume.service.ts
// FULL FILE — UPDATED: no shape change needed here, customer object is passed through as-is.
// (The bug was in the frontend mapping, not here — included for completeness/no drift.)

import jwt from "jsonwebtoken";
import { AppError } from "../../utils/AppError";
import customerService from "../customers/customer.service";
import loanApplicationService from "../loan-applications/loan-application.service";
import guarantorService from "../guarantors/guarantor.service";
import documentService from "../documents/document.service";

class ResumeService {
  async getStateFromToken(resumeToken: string) {
    let payload: any;
    try {
      payload = jwt.verify(
        resumeToken,
        process.env.JWT_SECRET || process.env.RESUME_TOKEN_SECRET || "change-me"
      );
    } catch {
      throw new AppError(401, "This resume link has expired. Please verify your phone again.");
    }

    if (payload.purpose !== "resume" || !payload.customerId) {
      throw new AppError(401, "Invalid resume token");
    }

    return this.getState(payload.customerId);
  }

  async getState(customerId: string) {
    const customer = await customerService.getById(customerId);

    const applications = await loanApplicationService.getAll({ customerId } as any);
    const latestApplication = Array.isArray(applications)
      ? [...applications].sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0] ?? null
      : null;

    const guarantors = await guarantorService.getAll(customerId);

    let documents: any[] = [];
    if (latestApplication) {
      documents = await documentService.getAll({ applicationId: latestApplication.id } as any);
    }

    let resumeStep: 1 | 2 | 3 | 4 | 5 = 2;
    if (latestApplication) resumeStep = 3;
    if (guarantors && guarantors.length > 0) resumeStep = 4;
    if (documents && documents.length > 0) resumeStep = 5;

    return { customer, application: latestApplication, guarantors, documents, resumeStep };
  }
}

export default new ResumeService();