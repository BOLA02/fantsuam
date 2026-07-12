"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const routes_1 = __importDefault(require("./routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const app = (0, express_1.default)();
// 1. Global security configuration with explicit authorization credentials policies
app.use((0, cors_1.default)({
    origin: "http://localhost:3000", // 🔓 Allows your Next.js frontend port access
    credentials: true, // 🔓 Permits Authorization headers & Cookie transfers
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
// 2. Parse incoming data BEFORE hitting routes
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// 3. Define your routes after data parser middleware
app.use("/api", routes_1.default);
app.get("/api/health", (_, res) => {
    res.json({
        success: true,
        message: "API is healthy",
    });
});
// 4. Error handler always goes last
app.use(error_middleware_1.errorHandler);
exports.default = app;
