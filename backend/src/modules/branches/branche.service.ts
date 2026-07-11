import branchRepository from "../branches/branche.repository";
import { AppError } from "../../utils/AppError";

class BranchService {
  async getAll() {
    return branchRepository.findAll();
  }

  async getById(id: string) {
    const branch = await branchRepository.findById(id);

    if (!branch) {
      throw new AppError(404, "Branch not found");
    }

    return branch;
  }

  async create(data: any) {
    const existingBranch = await branchRepository.findByCode(data.branchCode);

    if (existingBranch) {
      throw new AppError(409, "Branch code already exists");
    }

    return branchRepository.create(data);
  }

  async update(id: string, data: any) {
    await this.getById(id);

    return branchRepository.update(id, data);
  }

  async delete(id: string) {
    await this.getById(id);

    const users = await branchRepository.countUsers(id);

    if (users > 0) {
      throw new AppError(
        400,
        "Cannot delete a branch with assigned staff"
      );
    }

    return branchRepository.softDelete(id);
  }
}

export default new BranchService();