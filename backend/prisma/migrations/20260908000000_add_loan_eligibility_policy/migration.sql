ALTER TABLE "OrganizationSettings"
  ADD COLUMN "loanRequiresSavingsAccount" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "minimumSavingsBalanceForLoan" DECIMAL(15,2) NOT NULL DEFAULT 0;
