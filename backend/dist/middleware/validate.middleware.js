"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod"); // 🟢 Import the raw z namespace
const validate = (schema) => // 🟢 FIXED: Using z.ZodType directly (no deprecation warnings)
 (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            params: req.params,
            query: req.query,
        });
        next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: error.flatten().fieldErrors, // Returns clear field-specific errors
            });
        }
        next(error);
    }
};
exports.validate = validate;
