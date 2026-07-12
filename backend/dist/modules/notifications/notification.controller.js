"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notification_service_1 = require("./notification.service");
const apiResponse_1 = require("../../utils/apiResponse");
class NotificationController {
    service = new notification_service_1.NotificationService();
    getAllSms = async (req, res) => {
        const { search, status, page, pageSize } = req.query;
        const result = await this.service.getAllSms({
            search,
            status,
            page: page ? Number(page) : undefined,
            pageSize: pageSize ? Number(pageSize) : undefined,
        });
        return res.status(200).json(apiResponse_1.ApiResponse.success(result, 'SMS logs retrieved'));
    };
    sendManual = async (req, res) => {
        const { customerId, phone, templateCode, variables } = req.body;
        await this.service.sendSms({ customerId, phone, templateCode, variables: variables ?? {} });
        return res.status(202).json(apiResponse_1.ApiResponse.success(null, 'SMS queued'));
    };
    getTemplates = async (req, res) => {
        const result = await this.service.getTemplates();
        return res.status(200).json(apiResponse_1.ApiResponse.success(result, 'Templates retrieved'));
    };
}
exports.NotificationController = NotificationController;
