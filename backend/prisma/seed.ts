import prisma from "../src/config/prisma";
import { UserRole, UserStatus } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";

async function main() {
  // Branch
  const branch = await prisma.branch.upsert({
    where: {
      branchCode: "HQ",
    },
    update: {},
    create: {
      branchCode: "HQ",
      name: "Head Office",
      address: "Head Office",
      phone: "+234000000000",
      email: "info@microfinance.com",
    },
  });

  // Password
  const passwordHash = await bcrypt.hash("Admin@123", 10);

  // Super Admin
  await prisma.user.upsert({
    where: {
      email: "admin@microfinance.com",
    },
    update: {},
    create: {
      employeeNumber: "EMP-000001",
      firstName: "System",
      lastName: "Administrator",
      email: "admin@microfinance.com",
      phone: "08000000000",
      passwordHash: passwordHash,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      branchId: branch.id,
    },
  });

  // System user — used as the actor for automated/unauthenticated actions
  // (e.g. public loan application submissions). Should never log in.
  const systemPasswordHash = await bcrypt.hash(crypto.randomUUID(), 10);

  const systemUser = await prisma.user.upsert({
    where: {
      email: "system@internal.local",
    },
    update: {},
    create: {
      employeeNumber: "EMP-000000",
      firstName: "System",
      lastName: "Auto",
      email: "system@internal.local",
      phone: "00000000000",
      passwordHash: systemPasswordHash,
      role: UserRole.SYSTEM,
      status: UserStatus.ACTIVE,
      branchId: branch.id,
    },
  });

  console.log("System user ID:", systemUser.id);
  console.log("Seed completed.");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });