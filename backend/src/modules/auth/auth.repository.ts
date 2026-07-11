import prisma from "../../config/prisma";

export class AuthRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        branch: true,
      },
    });
  }

  async updateLastLogin(id: string) {
    return prisma.user.update({
      where: { id },
      data: {
        lastLoginAt: new Date(),
      },
    });
  }


  async findById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      branch: true,
    },
  });
}
}


export default new AuthRepository();