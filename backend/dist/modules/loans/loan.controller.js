"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoanController = void 0;
const loan_service_1 = require("./loan.service");
const apiResponse_1 = require("../../utils/apiResponse");
class LoanController {
    service = new loan_service_1.LoanService();
    getAll = async (req, res) => {
        const { search, status } = req.query;
        const result = await this.service.getAllLoans({ search, status });
        return res.status(200).json(apiResponse_1.ApiResponse.success(result, 'Loans retrieved successfully'));
    };
    getById = async (req, res) => {
        const id = req.params.id;
        const result = await this.service.getLoanById(id);
        return res.status(200).json(apiResponse_1.ApiResponse.success(result, 'Loan retrieved successfully'));
    };
    disburse = async (req, res) => {
        const id = req.params.id;
        const disbursedById = req.user.id; // set by `authenticate` middleware
        const result = await this.service.disburse(id, req.body, disbursedById);
        return res.status(200).json(apiResponse_1.ApiResponse.success(result, 'Loan disbursed successfully'));
    };
}
exports.LoanController = LoanController;
