import prisma from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { comparePassword, hashPassword } from "../../utils/password";
import { generateToken } from "../../utils/jwt";

const customerSelect = {
  id: true,
  customerNumber: true,
  firstName: true,
  lastName: true,
  email: true,
} as const;

class CustomerAuthService {
  async signup(email: string, password: string) {
    const customer = await prisma.customer.findFirst({
      where: { email, deletedAt: null, status: "ACTIVE" },
    });
    if (!customer) {
      throw new AppError(404, "No active loan application matches this email. Apply for a loan first.");
    }
    if (customer.passwordHash) {
      throw new AppError(409, "An account already exists for this email. Please sign in.");
    }

    const account = await prisma.customer.update({
      where: { id: customer.id },
      data: { passwordHash: await hashPassword(password) },
      select: customerSelect,
    });
    return this.session(account);
  }

  async login(email: string, password: string) {
    const customer = await prisma.customer.findFirst({
      where: { email, deletedAt: null, status: "ACTIVE" },
    });
    if (!customer?.passwordHash || !(await comparePassword(password, customer.passwordHash))) {
      throw new AppError(401, "Invalid email or password");
    }

    const account = await prisma.customer.findUniqueOrThrow({
      where: { id: customer.id }, select: customerSelect,
    });
    return this.session(account);
  }

  async me(customerId: string) {
    return prisma.customer.findUniqueOrThrow({ where: { id: customerId }, select: customerSelect });
  }

  private session(customer: { id: string; email: string | null }) {
    return {
      token: generateToken({ id: customer.id, email: customer.email!, role: "CUSTOMER" }),
      customer,
    };
  }
}

export default new CustomerAuthService();
