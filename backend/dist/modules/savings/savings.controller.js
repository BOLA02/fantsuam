"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavingsController = void 0;
const savings_service_1 = require("./savings.service");
const apiResponse_1 = require("../../utils/apiResponse");
class SavingsController {
    service = new savings_service_1.SavingsService();
    /**
     * Provision a savings account.
     *
     * This handles both cases:
     * 1. Customer already exists → create savings account for them.
     * 2. Customer does not exist → create customer first, then savings account.
     */
    provisionAccount = async (req, res) => {
        const performedById = req.user.id;
        const result = await this.service.provisionAccount(req.body, performedById);
        return res.status(201).json(apiResponse_1.ApiResponse.success(result, 'Savings account provisioned successfully'));
    };
    /**
     * Lookup customer by phone number.
     *
     * This is used by the frontend before submitting
     * the savings account form.
     */
    lookupCustomer = async (req, res) => {
        const phone = String(req.query.phone || '').trim();
        if (!phone) {
            return res.status(400).json(apiResponse_1.ApiResponse.error('Phone number is required'));
        }
        const result = await this.service.findCustomerByPhone(phone);
        return res.status(200).json(apiResponse_1.ApiResponse.success(result, result.exists
            ? 'Customer found'
            : 'Customer not found'));
    };
    /**
     * Existing direct account creation.
     *
     * Keep this only if other parts of the system still use it.
     * The new savings flow should use provisionAccount instead.
     */
    createAccount = async (req, res) => {
        const result = await this.service.createAccount(req.body);
        return res.status(201).json(apiResponse_1.ApiResponse.success(result, 'Savings account created'));
    };
    deposit = async (req, res) => {
        const performedById = req.user.id;
        const result = await this.service.deposit(req.body, performedById);
        return res.status(201).json(apiResponse_1.ApiResponse.success(result, 'Deposit recorded'));
    };
    withdrawal = async (req, res) => {
        const performedById = req.user.id;
        const result = await this.service.withdrawal(req.body, performedById);
        return res.status(201).json(apiResponse_1.ApiResponse.success(result, 'Withdrawal recorded'));
    };
    getAccount = async (req, res) => {
        const result = await this.service.getAccount(req.params.id);
        return res.status(200).json(apiResponse_1.ApiResponse.success(result, 'Savings account retrieved'));
    };
    getAllAccounts = async (req, res) => {
        const { search, status, page, pageSize, } = req.query;
        const result = await this.service.getAllAccounts({
            search,
            status,
            page: page ? Number(page) : undefined,
            pageSize: pageSize ? Number(pageSize) : undefined,
        });
        return res.status(200).json(apiResponse_1.ApiResponse.success(result, 'Savings accounts retrieved'));
    };
    getTransactions = async (req, res) => {
        const { page, pageSize, } = req.query;
        const result = await this.service.getTransactions(req.params.id, page ? Number(page) : undefined, pageSize ? Number(pageSize) : undefined);
        return res.status(200).json(apiResponse_1.ApiResponse.success(result, 'Savings transactions retrieved'));
    };
    getSummary = async (_req, res) => {
        const result = await this.service.getSummary();
        return res.status(200).json(apiResponse_1.ApiResponse.success(result, 'Savings summary retrieved'));
    };
}
exports.SavingsController = SavingsController;
