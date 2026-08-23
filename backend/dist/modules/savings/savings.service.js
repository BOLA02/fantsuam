"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavingsService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../config/prisma"));
const savings_repository_1 = require("./savings.repository");
const AppError_1 = require("../../utils/AppError");
const ledger_service_1 = require("../accounting/ledger.service");
const notification_service_1 = require("../notifications/notification.service");
const customer_repository_1 = __importDefault(require("../customers/customer.repository"));
function round2(n) {
    return Math.round(n * 100) / 100;
}
const MAX_RETRIES = 3;
class ConcurrentBalanceUpdateError extends Error {
}
class SavingsService {
    repository = new savings_repository_1.SavingsRepository();
    ledger = new ledger_service_1.LedgerService();
    notifications = new notification_service_1.NotificationService();
    /** Reserves the next number for an entity via NumberSequence, race-safe under $transaction. */
    async nextNumber(tx, entity, defaults) {
        const seq = await this.repository.upsertSequence(entity, defaults, tx);
        const padded = String(seq.currentNumber).padStart(seq.padding, '0');
        const year = seq.yearBased ? `${new Date().getFullYear()}-` : '';
        return `${seq.prefix}-${year}${padded}`;
    }
    async postTransaction(input, performedById) {
        const amount = round2(input.amount);
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            const account = await this.repository.findAccountById(input.savingsAccountId);
            if (!account)
                throw new AppError_1.AppError(404, 'Savings account not found');
            if (account.status !== 'ACTIVE') {
                throw new AppError_1.AppError(400, `Cannot post a transaction against an account in status ${account.status}`);
            }
            const balanceBefore = Number(account.balance);
            const balanceAfter = input.type === 'WITHDRAWAL' ? round2(balanceBefore - amount) : round2(balanceBefore + amount);
            if (input.type === 'WITHDRAWAL' && balanceAfter < 0) {
                throw new AppError_1.AppError(400, `Insufficient savings balance. Available balance: ${balanceBefore.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                })}`);
            }
            try {
                const result = await prisma_1.default.$transaction(async (tx) => {
                    const updated = await this.repository.updateBalanceConditional(account.id, account.balance, balanceAfter, tx);
                    if (updated.count === 0)
                        throw new ConcurrentBalanceUpdateError();
                    const reference = await this.nextNumber(tx, 'SAVINGS_TXN', {
                        prefix: 'TXN',
                        padding: 6,
                        yearBased: true,
                    });
                    const txnRow = await this.repository.createTransaction({
                        reference,
                        savingsAccountId: account.id,
                        transactionType: input.type,
                        amount,
                        balanceBefore: account.balance,
                        balanceAfter,
                        paymentMethod: input.paymentMethod,
                        description: input.description,
                        performedById,
                        transactionDate: new Date(),
                    }, tx);
                    // inside savings.service.ts -> postTransaction method
                    await this.ledger.recordEntry(tx, {
                        transactionType: input.type === 'WITHDRAWAL' ? 'SAVINGS_WITHDRAWAL' : 'SAVINGS_DEPOSIT',
                        amount,
                        direction: input.type === 'WITHDRAWAL' ? 'DEBIT' : 'CREDIT',
                        paymentMethod: input.paymentMethod,
                        reference: txnRow.reference,
                        narration: `Savings ${input.type.toLowerCase()} · ${account.accountNumber} · ${txnRow.reference}`,
                        savingsAccountId: account.id, // Used by service to grab the trailing balance
                        savingsTransactionId: txnRow.id, // Used by repository to build the 1-to-1 model relation hook
                    });
                    return txnRow;
                });
                // SMS after commit, same pattern as RepaymentService.
                const customer = account.customer;
                if (customer?.phone) {
                    await this.notifications.sendSms({
                        customerId: customer.id,
                        phone: customer.phone,
                        templateCode: input.type === 'WITHDRAWAL' ? 'SAVINGS_WITHDRAWAL' : 'SAVINGS_DEPOSIT',
                        variables: {
                            firstName: customer.firstName,
                            amount: amount.toString(),
                            accountNumber: account.accountNumber,
                            reference: result.reference,
                            balance: balanceAfter.toString(),
                        },
                    });
                }
                return result;
            }
            catch (err) {
                if (err instanceof ConcurrentBalanceUpdateError && attempt < MAX_RETRIES - 1) {
                    continue;
                }
                if (err instanceof ConcurrentBalanceUpdateError) {
                    throw new AppError_1.AppError(409, 'Could not complete transaction due to a concurrent update, please retry');
                }
                throw err;
            }
        }
        throw new AppError_1.AppError(409, 'Could not complete transaction due to a concurrent update, please retry');
    }
    async createAccount(payload) {
        const customer = await prisma_1.default.customer.findFirst({
            where: { id: payload.customerId, deletedAt: null },
        });
        if (!customer)
            throw new AppError_1.AppError(404, 'Customer not found');
        return prisma_1.default.$transaction(async (tx) => {
            const accountNumber = await this.nextNumber(tx, 'SAVINGS_ACCOUNT', {
                prefix: 'SAV',
                padding: 6,
                yearBased: false,
            });
            return this.repository.createAccount({ accountNumber, customerId: payload.customerId, branchId: payload.branchId }, tx);
        });
    }
    async deposit(payload, performedById) {
        if (round2(payload.amount) <= 0)
            throw new AppError_1.AppError(400, 'Amount must be greater than 0');
        return this.postTransaction({ ...payload, type: 'DEPOSIT' }, performedById);
    }
    async withdrawal(payload, performedById) {
        if (round2(payload.amount) <= 0)
            throw new AppError_1.AppError(400, 'Amount must be greater than 0');
        return this.postTransaction({ ...payload, type: 'WITHDRAWAL' }, performedById);
    }
    async getAccount(id) {
        const account = await this.repository.findAccountById(id);
        if (!account)
            throw new AppError_1.AppError(404, 'Savings account not found');
        return account;
    }
    async getAllAccounts(query) {
        return this.repository.findAllAccounts(query);
    }
    async getTransactions(savingsAccountId, page = 1, pageSize = 20) {
        const account = await this.repository.findAccountById(savingsAccountId);
        if (!account)
            throw new AppError_1.AppError(404, 'Savings account not found');
        return this.repository.findTransactionsByAccount(savingsAccountId, page, pageSize);
    }
    async getSummary() {
        return this.repository.getSummary();
    }
    // savings.service.ts — new method
    async provisionAccount(input, performedById) {
        const initialDeposit = round2(input.initialDeposit);
        if (initialDeposit <= 0) {
            throw new AppError_1.AppError(400, 'Initial deposit must be greater than 0');
        }
        const phone = input.phone.trim();
        if (!phone) {
            throw new AppError_1.AppError(400, 'Customer phone number is required');
        }
        let result;
        try {
            result = await prisma_1.default.$transaction(async (tx) => {
                // ------------------------------------------------
                // 1. FIND OR CREATE CUSTOMER
                // ------------------------------------------------
                let customer = await this.repository.findCustomerByPhone(phone, tx);
                if (!customer) {
                    if (!input.firstName?.trim() || !input.lastName?.trim()) {
                        throw new AppError_1.AppError(400, 'Customer not found. First name and last name are required to create a new customer.');
                    }
                    const customerNumber = await this.nextNumber(tx, 'CUSTOMER', {
                        prefix: 'CUS',
                        padding: 6,
                        yearBased: false,
                    });
                    customer = await customer_repository_1.default.create({
                        customerNumber,
                        phone,
                        firstName: input.firstName.trim(),
                        lastName: input.lastName.trim(),
                        email: input.email?.trim() || undefined,
                        bvn: input.bvn?.trim() || undefined,
                        nin: input.nin?.trim() || undefined,
                        branchId: input.branchId,
                    }, tx);
                }
                // ------------------------------------------------
                // 2. FRIENDLY PRE-CHECK (not the source of truth)
                // ------------------------------------------------
                const existingAccount = await this.repository.findAccountByCustomerId(customer.id, tx);
                if (existingAccount) {
                    throw new AppError_1.AppError(409, `Customer already has savings account ${existingAccount.accountNumber}`);
                }
                // ------------------------------------------------
                // 3. CREATE SAVINGS ACCOUNT
                //    Partial unique index on (customerId) WHERE deletedAt IS NULL
                //    is what actually blocks a concurrent duplicate — P2002 caught below.
                // ------------------------------------------------
                const accountNumber = await this.nextNumber(tx, 'SAVINGS_ACCOUNT', {
                    prefix: 'SAV',
                    padding: 6,
                    yearBased: false,
                });
                const account = await this.repository.createAccount({
                    accountNumber,
                    customerId: customer.id,
                    branchId: input.branchId ?? customer.branchId ?? undefined,
                }, tx);
                // ------------------------------------------------
                // 4. INITIAL DEPOSIT
                // ------------------------------------------------
                const balanceBefore = 0;
                const balanceAfter = initialDeposit;
                await this.repository.updateBalanceConditional(account.id, balanceBefore, balanceAfter, tx);
                const reference = await this.nextNumber(tx, 'SAVINGS_TXN', {
                    prefix: 'TXN',
                    padding: 6,
                    yearBased: true,
                });
                const initialTransaction = await this.repository.createTransaction({
                    reference,
                    savingsAccountId: account.id,
                    transactionType: 'DEPOSIT',
                    amount: initialDeposit,
                    balanceBefore,
                    balanceAfter,
                    paymentMethod: input.paymentMethod,
                    description: input.description ?? 'Initial savings deposit',
                    performedById,
                    transactionDate: new Date(),
                }, tx);
                // ------------------------------------------------
                // 5. LEDGER ENTRY
                // ------------------------------------------------
                await this.ledger.recordEntry(tx, {
                    transactionType: 'SAVINGS_DEPOSIT',
                    amount: initialDeposit,
                    direction: 'CREDIT',
                    paymentMethod: input.paymentMethod,
                    reference: initialTransaction.reference,
                    narration: `Initial savings deposit · ${accountNumber} · ${initialTransaction.reference}`,
                    savingsAccountId: account.id,
                    savingsTransactionId: initialTransaction.id,
                });
                return { customer, account, initialTransaction };
            });
        }
        catch (err) {
            // Race: two concurrent provision calls for the same customer.
            // The partial unique index on SavingsAccount(customerId) WHERE deletedAt IS NULL
            // rejects the loser here — this is the actual guarantee, not the pre-check above.
            if (err instanceof client_1.Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
                throw new AppError_1.AppError(409, 'Customer already has a savings account');
            }
            throw err;
        }
        // ------------------------------------------------
        // 6. SEND SMS AFTER COMMIT
        // ------------------------------------------------
        if (result.customer?.phone) {
            await this.notifications.sendSms({
                customerId: result.customer.id,
                phone: result.customer.phone,
                templateCode: 'SAVINGS_DEPOSIT',
                variables: {
                    firstName: result.customer.firstName,
                    amount: initialDeposit.toString(),
                    accountNumber: result.account.accountNumber,
                    reference: result.initialTransaction.reference,
                    balance: initialDeposit.toString(),
                },
            });
        }
        // ------------------------------------------------
        // 7. RETURN UPDATED ACCOUNT
        // ------------------------------------------------
        const updatedAccount = await this.repository.findAccountById(result.account.id);
        if (!updatedAccount) {
            throw new AppError_1.AppError(404, 'Savings account could not be retrieved after creation');
        }
        return {
            customer: result.customer,
            account: updatedAccount,
            initialDeposit: result.initialTransaction,
        };
    }
    async findCustomerByPhone(phone) {
        const customer = await this.repository.findCustomerByPhone(phone);
        if (!customer) {
            return {
                exists: false,
                customer: null,
                hasSavingsAccount: false,
                savingsAccount: null,
            };
        }
        const existingAccount = await this.repository.findAccountByCustomerId(customer.id);
        return {
            exists: true,
            customer: {
                id: customer.id,
                customerNumber: customer.customerNumber,
                firstName: customer.firstName,
                lastName: customer.lastName,
                phone: customer.phone,
                branchId: customer.branchId,
            },
            hasSavingsAccount: !!existingAccount,
            savingsAccount: existingAccount
                ? {
                    id: existingAccount.id,
                    accountNumber: existingAccount.accountNumber,
                    status: existingAccount.status,
                }
                : null,
        };
    }
}
exports.SavingsService = SavingsService;
