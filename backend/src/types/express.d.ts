import { User, Customer } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      customer?: Customer;
      publicCustomerId?: string;
      applicationFeePayment?: import("@prisma/client").ApplicationFeePayment;
    }
  }
}

export {};
