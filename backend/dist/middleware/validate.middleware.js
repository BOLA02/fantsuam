"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema) => (req, res, next) => {
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
            const details = error.issues.map((issue) => {
                const field = issue.path
                    .filter((part) => part !== "body")
                    .map((part) => String(part).replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase()))
                    .join(" ");
                return field ? `${field}: ${issue.message}` : issue.message;
            });
            return res.status(400).json({
                success: false,
                message: details.join(". "),
                errors: error.flatten().fieldErrors,
            });
        }
        next(error);
    }
};
exports.validate = validate;
