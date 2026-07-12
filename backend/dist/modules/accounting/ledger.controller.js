"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerController = void 0;
const ledger_service_1 = require("./ledger.service");
const apiResponse_1 = require("../../utils/apiResponse");
class LedgerController {
    service = new ledger_service_1.LedgerService();
    getAll = async (req, res) => {
        const { search, loanId, page, pageSize } = req.query;
        const result = await this.service.getAll({
            search,
            loanId,
            page: page ? Number(page) : undefined,
            pageSize: pageSize ? Number(pageSize) : undefined,
        });
        return res.status(200).json(apiResponse_1.ApiResponse.success(result, 'Ledger retrieved'));
    };
    getForLoan = async (req, res) => {
        const result = await this.service.getForLoan(req.params.loanId);
        return res.status(200).json(apiResponse_1.ApiResponse.success(result, 'Loan ledger retrieved'));
    };
}
exports.LedgerController = LedgerController;
