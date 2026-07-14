"use strict";
// src/modules/search/search.controller.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const search_service_1 = __importDefault(require("./search.service"));
class SearchController {
    async global(req, res, next) {
        try {
            const keyword = req.query.q || "";
            const results = await search_service_1.default.searchAll(keyword);
            res.status(200).json({
                success: true,
                data: { results },
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new SearchController();
