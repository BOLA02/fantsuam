import { Request, Response, NextFunction } from "express";
import { UserStatus } from "@prisma/client";
import userService from "./user.service";

class UserController {
  async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const users = await userService.getAll();

      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = await userService.getById(req.params.id as string);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = await userService.create(req.body);

      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = await userService.update(
        req.params.id as string,
        req.body
      );

      res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      await userService.resetPassword(
        req.params.id as string,
        req.body.password
      );

      res.status(200).json({
        success: true,
        message: "Password reset successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      await userService.changePassword(
        req.user!.id,
        req.body.currentPassword,
        req.body.newPassword
      );

      res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async changeStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = await userService.changeStatus(
        req.params.id as string,
        req.body.status as UserStatus
      );

      res.status(200).json({
        success: true,
        message: "User status updated successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      await userService.delete(req.params.id as string);

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();