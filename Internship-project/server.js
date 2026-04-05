import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import connectDB from "./config/db.js";
import "./config/redis.js";
import contactRoutes from "./routes/contacts.js";
import authRoutes from "./routes/auth.js";
import errorHandler from "./middleware/error.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);  // ← from path, NOT express

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);



app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

app.use(errorHandler);