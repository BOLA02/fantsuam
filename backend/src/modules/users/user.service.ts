import { UserStatus } from "@prisma/client";

import userRepository from "./user.repository";
import branchRepository from "../branches/branche.repository";

import { hashPassword, comparePassword } from "../../utils/password";
import { AppError } from "../../utils/AppError";

class UserService {
  async getAll() {
    return userRepository.findAll();
  }

  async getById(id: string) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new AppError(404, "User not found");
    }

    return user;
  }

  async create(data: any) {
    const emailExists = await userRepository.findByEmail(data.email);

    if (emailExists) {
      throw new AppError(409, "Email already exists");
    }

    const employeeExists =
      await userRepository.findByEmployeeNumber(
        data.employeeNumber
      );

    if (employeeExists) {
      throw new AppError(
        409,
        "Employee number already exists"
      );
    }

    const branch = await branchRepository.findById(
      data.branchId
    );

    if (!branch) {
      throw new AppError(404, "Branch not found");
    }

    const passwordHash = await hashPassword(data.password);

    delete data.password;

    return userRepository.create({
      ...data,
      passwordHash,
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

    return userRepository.update(id, data);
  }

  async resetPassword(
    id: string,
    password: string
  ) {
    await this.getById(id);

    const passwordHash = await hashPassword(password);

    return userRepository.updatePassword(
      id,
      passwordHash
    );
  }

  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await this.getById(id);

    const valid = await comparePassword(
      currentPassword,
      user.passwordHash
    );

    if (!valid) {
      throw new AppError(
        400,
        "Current password is incorrect"
      );
    }

    const passwordHash = await hashPassword(
      newPassword
    );

    return userRepository.updatePassword(
      id,
      passwordHash
    );
  }

  async changeStatus(
    id: string,
    status: UserStatus
  ) {
    await this.getById(id);

    return userRepository.update(id, {
      status,
    });
  }

  async delete(id: string) {
    await this.getById(id);

    return userRepository.softDelete(id);
  }
}

export default new UserService();