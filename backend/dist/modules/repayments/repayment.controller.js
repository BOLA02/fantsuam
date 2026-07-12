"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepaymentController = void 0;
const repayment_service_1 = require("./repayment.service");
const apiResponse_1 = require("../../utils/apiResponse");
class RepaymentController {
    service = new repayment_service_1.RepaymentService();
    recordCash = async (req, res) => {
        const receivedById = req.user.id;
        const result = await this.service.recordCashPayment(req.body, receivedById);
        return res.status(201).json(apiResponse_1.ApiResponse.success(result, 'Cash payment recorded'));
    };
    reportBankTransfer = async (req, res) => {
        const receivedById = req.user.id;
        const result = await this.service.reportBankTransfer(req.body, receivedById);
        return res.status(201).json(apiResponse_1.ApiResponse.success(result, 'Bank transfer reported, pending verification'));
    };
    confirm = async (req, res) => {
        const confirmedById = req.user.id;
        const result = await this.service.confirmBankTransfer(req.params.id, confirmedById);
        return res.status(200).json(apiResponse_1.ApiResponse.success(result, 'Payment confirmed'));
    };
    getAll = async (req, res) => {
        const { search, status, loanId } = req.query;
        const result = await this.service.getAll({ search, status, loanId });
        return res.status(200).json(apiResponse_1.ApiResponse.success(result, 'Repayments retrieved'));
    };
    getLedger = async (req, res) => {
        const result = await this.service.getLedgerForLoan(req.params.loanId);
        return res.status(200).json(apiResponse_1.ApiResponse.success(result, 'Ledger retrieved'));
    };
}
exports.RepaymentController = RepaymentController;
