// src/modules/customers/customer.service.ts
// FULL FILE — UPDATED: added getByPhone() for the OTP flow

import customerRepository from "./customer.repository";
import branchRepository from "../branches/branche.repository";

import { AppError } from "../../utils/AppError";

class CustomerService {
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

  // Used by the OTP resume flow. Returns null instead of throwing —
  // callers decide whether a "not found" phone should be silent or an error.
  async getByPhone(phone: string) {
    return customerRepository.findByPhone(phone);
  }

  async create(data: any) {
    const existingCustomer =
      await customerRepository.findByCustomerNumber(
        data.customerNumber
      );

    if (existingCustomer) {
      throw new AppError(
        409,
        "Customer number already exists"
      );
    }

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