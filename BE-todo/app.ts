import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookiParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import todoRoutes from "./routes/todoRoutes";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookiParser());
app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);

const mongooseURL = `mongodb+srv://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@cluster0.jccpq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
mongoose
  .connect(mongooseURL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error: ", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
