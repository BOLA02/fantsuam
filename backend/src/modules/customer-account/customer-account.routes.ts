import { Router } from "express";
import { authenticateCustomer } from "../../middleware/customer-auth.middleware";
import controller from "./customer-account.controller";

const router = Router();
router.use(authenticateCustomer);
router.get("/loans", controller.loans);
router.get("/repayments", controller.repayments);
export default router;
