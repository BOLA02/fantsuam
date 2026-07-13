// src/routes/index.ts (or wherever this root router lives)
// FULL FILE — UPDATED: added otp and resume routes

import { Router } from "express";

import authRoutes from "../modules/auth";
import branchRoutes from "../modules/branches";
import userRoutes from "../modules/users";
import customerRoutes from "../modules/customers";
import productRoutes from "../modules/loan-products";
import loanApplicationRoutes from "../modules/loan-applications";
import guarantorRoutes from "../modules/guarantors";
import documentRoutes from "../modules/documents";
import loanRoutes from "../modules/loans";
import repaymentRoute from "../modules/repayments";
import ledgerRoutes from "../modules/accounting";
import sms from "../modules/notifications";
import otpRoutes from "../modules/otp";
import resumeRoutes from "../modules/resume";
import searchRoutes from "../modules/search";
import settingsRoutes from "../modules/settings";

const router = Router();

router.use("/auth", authRoutes);
router.use("/branches", branchRoutes);
router.use("/users", userRoutes);
router.use("/customers", customerRoutes);
router.use('/loan-products', productRoutes);
router.use("/loan-applications", loanApplicationRoutes);
router.use("/guarantors", guarantorRoutes);
router.use("/documents", documentRoutes);
router.use("/loans", loanRoutes);
router.use("/repayments", repaymentRoute);
router.use("/ledger", ledgerRoutes);
router.use("/sms", sms);
router.use("/otp", otpRoutes);
router.use("/resume", resumeRoutes);
router.use("/search", searchRoutes);
router.use("/settings", settingsRoutes);


export default router;