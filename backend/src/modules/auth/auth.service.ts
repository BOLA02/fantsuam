import authRepository from "./auth.repository";
import { comparePassword } from "../../utils/password";
import { generateToken } from "../../utils/jwt";
import { AppError } from "../../utils/AppError";

class AuthService {
  async login(email: string, password: string) {
    const user = await authRepository.findByEmail(email);

    if (!user) {
      throw new AppError(
  401,
  "Invalid email or password"
);
    }

    if (user.status !== "ACTIVE") {
      throw new AppError(
  403,
  "Account is inactive"
);
    }

    const validPassword = await comparePassword(
      password,
      user.passwordHash
    );

    if (!validPassword) {
     throw new AppError(401, "Invalid email or password");
    }

    await authRepository.updateLastLogin(user.id);

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        employeeNumber: user.employeeNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        branch: user.branch,
      },
    };
  }

  async getCurrentUser(userId: string) {
  const user = await authRepository.findById(userId);

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return {
    id: user.id,
    employeeNumber: user.employeeNumber,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    status: user.status,
    branch: user.branch,
  };
}
}

export default new AuthService();