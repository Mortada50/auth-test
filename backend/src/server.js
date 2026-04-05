import "dotenv/config";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import { corsMiddleware } from "./config/cors.js";
import { generalLimiter } from "./middleware/rateLimiter.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";


// ───── Routes ─────
 import webhookRoutes from "./webhooks/clerk.webhook.js";
 import authRoutes from "./routes/auth.routes.js";
// import doctorRoutes from "./routes/doctor.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

const app = express();
app.set("trust proxy", 1);

// ───── Connect Database ─────
connectDB();

// ───── Security Middleware ─────
app.use(helmet());
app.use(corsMiddleware);

// ───── Webhook Route (يجب قبل express.json لأنه يحتاج raw body) ─────
app.use("/api/webhooks", webhookRoutes);

// ───── Body Parsers ─────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ───── Logger ─────
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ───── Rate Limiting ─────
app.use("/api", generalLimiter);

// ───── API Routes ─────
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);


// ───── Error Handlers ─────
app.use(notFound);
app.use(errorHandler);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`);
});
