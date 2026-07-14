"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const customer_auth_service_1 = __importDefault(require("./customer-auth.service"));
class CustomerAuthController {
    signup = async (req, res, next) => {
        try {
            res.status(201).json({ success: true, data: await customer_auth_service_1.default.signup(req.body.email, req.body.password) });
        }
        catch (error) {
            next(error);
        }
    };
    login = async (req, res, next) => {
        try {
            res.json({ success: true, data: await customer_auth_service_1.default.login(req.body.email, req.body.password) });
        }
        catch (error) {
            next(error);
        }
    };
    me = async (req, res, next) => {
        try {
            res.json({ success: true, data: await customer_auth_service_1.default.me(req.customer.id) });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.default = new CustomerAuthController();
