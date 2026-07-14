import { Request, Response, NextFunction } from "express";
import service from "./customer-auth.service";

class CustomerAuthController {
  signup = async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(201).json({ success: true, data: await service.signup(req.body.email, req.body.password) }); }
    catch (error) { next(error); }
  };
  login = async (req: Request, res: Response, next: NextFunction) => {
    try { res.json({ success: true, data: await service.login(req.body.email, req.body.password) }); }
    catch (error) { next(error); }
  };
  me = async (req: Request, res: Response, next: NextFunction) => {
    try { res.json({ success: true, data: await service.me(req.customer!.id) }); }
    catch (error) { next(error); }
  };
}
export default new CustomerAuthController();
