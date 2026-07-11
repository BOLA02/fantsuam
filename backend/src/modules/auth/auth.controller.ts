import { Request, Response, NextFunction } from "express";

import authService from "./auth.service";

class AuthController {
  async login(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await authService.login(
        req.body.email,
        req.body.password
      );

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async me(
    req: Request, 
    res: Response,
    next: NextFunction
  ) {
    try {
    
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const result = await authService.getCurrentUser(req.user.id);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(
    req: Request,
    res: Response
  ) {
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  }
}

export default new AuthController();
