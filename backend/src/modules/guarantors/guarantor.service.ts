// src/modules/guarantors/guarantor.service.ts

import prisma from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import guarantorRepository from "./guarantor.respository";
import {
  CreateGuarantorInput,
  UpdateGuarantorInput,
} from "./guarantor.types";

class GuarantorService {
  async getAll(customerId?: string) {
    return guarantorRepository.findAll(customerId);
  }

  async getById(id: string) {
    const guarantor = await guarantorRepository.findById(id);

    if (!guarantor) {
      throw new AppError(404, "Guarantor not found");
    }

    return guarantor;
  }

  async create(data: CreateGuarantorInput) {
    const customer = await prisma.customer.findFirst({
      where: { id: data.customerId, deletedAt: null },
    });

    if (!customer) {
      throw new AppError(404, "Customer not found");
    }

    return guarantorRepository.create(data);
  }

  async update(id: string, data: UpdateGuarantorInput) {
    await this.getById(id);

    return guarantorRepository.update(id, data);
  }

  async delete(id: string) {
    await this.getById(id);

    return guarantorRepository.delete(id);
  }
}

export default new GuarantorService();