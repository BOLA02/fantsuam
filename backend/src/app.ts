import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import routes from "./routes";

import { errorHandler } from "./middleware/error.middleware";

const app = express();

// 1. Global security configuration supporting multi-origin setups
const allowedOrigins = [
  "http://localhost:3000",
  "https://vercel.app" // 🚀 Allows your production Vercel frontend access
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
      preflightContinue: false, 
    optionsSuccessStatus: 204
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
