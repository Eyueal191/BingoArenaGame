import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

// Routes
app.use("/api/auth", authRoutes);
export default app;
