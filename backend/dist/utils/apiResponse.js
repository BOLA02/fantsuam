"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
class ApiResponse {
    static success(data, message = "Success") {
        return {
            success: true,
            message,
            data,
        };
    }
    static error(message) {
        return {
            success: false,
            message,
        };
    }
}
exports.ApiResponse = ApiResponse;
