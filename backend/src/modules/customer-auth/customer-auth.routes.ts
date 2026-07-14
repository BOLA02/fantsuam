import { Router } from "express";
import controller from "./customer-auth.controller";
import { validate } from "../../middleware/validate.middleware";
import { authenticateCustomer } from "../../middleware/customer-auth.middleware";
import { customerLoginSchema, customerSignupSchema } from "./customer-auth.validation";

const router = Router();
router.post("/signup", validate(customerSignupSchema), controller.signup);
router.post("/login", validate(customerLoginSchema), controller.login);
router.get("/me", authenticateCustomer, controller.me);
export default router;
