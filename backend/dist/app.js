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
// 1. Global security configuration supporting multi-origin setups
const allowedOrigins = [
    "http://localhost:3000",
    "https://fantsuam-ashy.vercel.app" // 🚀 Updated to your actual project domain
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, postman, or curl requests)
        if (!origin) {
            return callback(null, true);
        }
        // Check if the domain is explicitly listed in our array
        const isAllowed = allowedOrigins.indexOf(origin) !== -1;
        // Check if it's a dynamic preview or deployment subdomain of your project
        const isVercelSubdomain = origin.startsWith("https://fantsuam-") && origin.endsWith(".vercel.app");
        if (isAllowed || isVercelSubdomain) {
            callback(null, true);
        }
        else {
            // Log out the blocked origin to your Render dashboard logs for visual auditing
            console.warn(`Blocked by CORS: ${origin}`);
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Application-Fee-Token"],
    preflightContinue: false,
    optionsSuccessStatus: 204
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
