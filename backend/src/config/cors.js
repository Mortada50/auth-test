import cors from "cors";

const allowedOrigins = [
  process.env.DOCTOR_DASHBOARD_URL,
  process.env.PHARMACY_DASHBOARD_URL,
  process.env.ADMIN_DASHBOARD_URL,
  process.env.PATIENT_APP_URL,
].filter(Boolean);

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // السماح للطلبات بدون origin (Postman, mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
