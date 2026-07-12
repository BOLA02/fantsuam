import prisma from "../src/config/prisma";
import { UserRole, UserStatus } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";

async function main() {
  // 1. Seed Branch
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

  // 2. Seed Password
  const passwordHash = await bcrypt.hash("Admin@123", 10);

  // 3. Seed Super Admin
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

  // 4. Seed System User
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

  // 5. Seed the missing SMS templates using Prisma's raw SQL utility 🚀
  console.log("Seeding SMS templates...");
  
  const templates = [
    { code: 'APPLICATION_SUBMITTED', name: 'Application Submitted', msg: 'Hi {{firstName}}, your loan application {{applicationNumber}} for ₦{{amount}} has been received and is under review.' },
    { code: 'APPLICATION_APPROVED', name: 'Application Approved', msg: 'Hi {{firstName}}, great news! Your loan application {{applicationNumber}} for ₦{{amount}} has been approved.' },
    { code: 'APPLICATION_REJECTED', name: 'Application Rejected', msg: 'Hi {{firstName}}, we regret to inform you that your loan application {{applicationNumber}} was not approved at this time.' },
    { code: 'LOAN_DISBURSEMENT', name: 'Loan Disbursement', msg: 'Hi {{firstName}}, ₦{{amount}} has been disbursed to you for loan {{loanNumber}}. Thank you for choosing us.' },
    { code: 'PAYMENT_RECEIPT', name: 'Payment Receipt', msg: 'Hi {{firstName}}, we received your payment of ₦{{amount}} for loan {{loanNumber}} (Receipt: {{receiptNumber}}). Outstanding balance: ₦{{balance}}.' },
    { code: 'REPAYMENT_REMINDER', name: 'Repayment Reminder', msg: 'Hi {{firstName}}, a payment of ₦{{amount}} for loan {{loanNumber}} is due on {{dueDate}}. Please make your payment on time to avoid penalties.' },
    { code: 'RESUME_OTP', name: 'Resume Application OTP', msg: 'Your MicroFinance verification code is {{code}}. It expires in {{minutes}} minutes. Do not share this code.' }
  ];

  for (const t of templates) {
    // Escapes MySQL quotes safely to make sure special symbols don't crash the query execution loop
    await prisma.$executeRawUnsafe(`
      INSERT INTO \`SmsTemplate\` (id, code, name, message, active, createdAt)
      SELECT UUID(), '${t.code}', '${t.name}', '${t.msg}', true, NOW()
      WHERE NOT EXISTS (SELECT 1 FROM \`SmsTemplate\` WHERE \`code\` = '${t.code}');
    `);
  }

  console.log("Seed completed successfully.");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
