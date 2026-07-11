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

export default router;