import { Request, Response, NextFunction } from "express";
import customerService from "./customer.service";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";

class CustomerController {
  async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const customers = await customerService.getAll();

      res.status(200).json({
        success: true,
        data: customers,
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
      const customer = await customerService.getById(
        req.params.id as string
      );

      res.status(200).json({
        success: true,
        data: customer,
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
      const customer = await customerService.create(req.body);

      res.status(201).json({
        success: true,
        message: "Customer created successfully",
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  async createForApplication(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const feePayment = (req as any).applicationFeePayment;
      if (feePayment?.customerId) {
        throw new (await import("../../utils/AppError")).AppError(409, "This application fee has already been assigned to a customer");
      }
      let verifiedCustomerId: string | undefined;
      const resumeToken = req.header("X-Resume-Token");
      if (resumeToken) {
        try {
          const payload = jwt.verify(resumeToken, process.env.RESUME_TOKEN_SECRET || env.JWT_SECRET) as {
            customerId?: string;
            purpose?: string;
          };
          if (payload.purpose === "resume") verifiedCustomerId = payload.customerId;
        } catch {
          // The service will require a valid matching token when the phone exists.
        }
      }
      const customer = await customerService.createOrReuseForApplication(req.body, verifiedCustomerId);
      if (feePayment) {
        await (await import("../../config/prisma")).default.applicationFeePayment.update({
          where: { id: feePayment.id },
          data: { customerId: customer.id },
        });
      }

      const applicationAccessToken = jwt.sign(
        { customerId: customer.id, purpose: "public-application" },
        env.JWT_SECRET,
        { expiresIn: "2h" }
      );
      res.status(200).json({
        success: true,
        message: "Customer ready for loan application",
        data: { ...customer, applicationAccessToken },
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
      const customer = await customerService.update(
        req.params.id as string,
        req.body
      );

      res.status(200).json({
        success: true,
        message: "Customer updated successfully",
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  async search(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const keyword = req.query.q as string;

      const customers = await customerService.search(keyword);

      res.status(200).json({
        success: true,
        data: customers,
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
      await customerService.delete(req.params.id as string);

      res.status(200).json({
        success: true,
        message: "Customer deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }


async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await customerService.getById(req.customer!.id);
      res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }
  
}
export default new CustomerController();
