
import customerRepository from "./customer.repository";
import branchRepository from "../branches/branche.repository";

import { AppError } from "../../utils/AppError";
import crypto from "crypto";

function normalizePhone(phone: string): string {
  const compact = phone.trim().replace(/[\s()\-]/g, "");
  if (compact.startsWith("+234")) return `0${compact.slice(4)}`;
  if (compact.startsWith("234") && compact.length === 13) return `0${compact.slice(3)}`;
  return compact;
}

class CustomerService {
  private async customerNumber() {
    for (let attempt = 0; attempt < 5; attempt++) {
      const value = `CUS-${new Date().getFullYear()}-${crypto.randomInt(100000, 1000000)}`;
      if (!(await customerRepository.findByCustomerNumber(value))) return value;
    }
    throw new AppError(500, "Unable to generate a customer number");
  }
  async getAll() {
    return customerRepository.findAll();
  }

  async getById(id: string) {
    const customer = await customerRepository.findById(id);

    if (!customer) {
      throw new AppError(404, "Customer not found");
    }

    return customer;
  }


  async getByPhone(phone: string) {
    return customerRepository.findByPhone(phone);
  }

  async create(data: any) {
    data = { ...data, customerNumber: await this.customerNumber(), phone: normalizePhone(data.phone) };

    const existingPhone =
      await customerRepository.findByPhone(data.phone);

    if (existingPhone) {
      throw new AppError(
        409,
        "Phone number already exists"
      );
    }

    if (data.email) {
      const existingEmail =
        await customerRepository.findByEmail(
          data.email
        );

      if (existingEmail) {
        throw new AppError(
          409,
          "Email already exists"
        );
      }
    }

    if (data.branchId) {
      const branch = await branchRepository.findById(
        data.branchId
      );

      if (!branch) {
        throw new AppError(404, "Branch not found");
      }
    }

    return customerRepository.create({
      ...data,
      dateOfBirth: new Date(data.dateOfBirth),
    });
  }

  /**
   * Public loan applications may start with a customer who was already
   * registered by staff while opening a savings account. In that case the
   * phone number identifies the existing membership and must not be treated
   * as an attempt to create a duplicate customer.
   */
  async createOrReuseForApplication(data: any, verifiedCustomerId?: string) {
    const phone = normalizePhone(data.phone);
    const existingPhone = await customerRepository.findByPhone(phone);

    if (existingPhone) {
      if (existingPhone.status !== "ACTIVE" || existingPhone.deletedAt) {
        throw new AppError(400, "Customer is not active");
      }

      if (verifiedCustomerId !== existingPhone.id) {
        throw new AppError(403, "PHONE_VERIFICATION_REQUIRED");
      }

      return customerRepository.updateApplicationProfile(existingPhone.id, { ...data, phone });
    }

    return this.create({ ...data, phone });
  }

  async update(id: string, data: any) {
    await this.getById(id);

    if (data.branchId) {
      const branch = await branchRepository.findById(
        data.branchId
      );

      if (!branch) {
        throw new AppError(404, "Branch not found");
      }
    }

    return customerRepository.update(id, data);
  }

  async search(keyword: string) {
    return customerRepository.search(keyword);
  }

  async delete(id: string) {
    await this.getById(id);

    return customerRepository.softDelete(id);
  }
}

export default new CustomerService();
