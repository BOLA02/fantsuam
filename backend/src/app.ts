import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import routes from "./routes";

import { errorHandler } from "./middleware/error.middleware";

const app = express();

// 1. Global security configuration with explicit authorization credentials policies
app.use(
  cors({
    origin: "http://localhost:3000", // 🔓 Allows your Next.js frontend port access
    credentials: true,               // 🔓 Permits Authorization headers & Cookie transfers
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(helmet());
app.use(compression());

// 2. Parse incoming data BEFORE hitting routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 3. Define your routes after data parser middleware
app.use("/api", routes);

app.get("/api/health", (_, res) => {
  res.json({
    success: true,
    message: "API is healthy",
  });
});

// 4. Error handler always goes last
app.use(errorHandler);

export default app;
