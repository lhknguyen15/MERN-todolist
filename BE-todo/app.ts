import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import todoRoutes from "./routes/todoRoutes";
import cors from "cors";
import { CORS_ORIGINS, MONGODB_URI } from "./config/env";

const app = express();
app.use(
  cors({
    origin: CORS_ORIGINS,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown MongoDB connection error";
    const safeMessage = message.replace(
      /mongodb(?:\+srv)?:\/\/[^\s@]+@/gi,
      "mongodb+srv://[credentials-redacted]@"
    );
    console.error("MongoDB connection failed:", safeMessage);
    process.exit(1);
  }
};

void startServer();
