import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import plantRoutes from "./routes/plants.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import adminRoutes from "./routes/admin.js";

const app = express();

// CORS — allow comma-separated CLIENT_URL list, or * if not set
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",").map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // allow curl/postman/server-to-server
    if (allowedOrigins.length === 0 || allowedOrigins.includes("*")) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(null, true); // permissive in dev — change for prod if needed
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "10mb" })); // big enough for base64 image uploads

app.get("/api/health", (_req, res) => res.json({ ok: true, name: "PLANTERY API" }));
app.use("/api/auth", authRoutes);
app.use("/api/plants", plantRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

const port = process.env.PORT || 5000;
connectDB(process.env.MONGO_URI)
  .then(() => app.listen(port, () => console.log(`🌱 PLANTERY API on http://localhost:${port}`)))
  .catch(err => { console.error("DB error", err); process.exit(1); });
