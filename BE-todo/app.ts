import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const mongooseURL = `mongodb+srv://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@cluster0.jccpq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
mongoose
  .connect(mongooseURL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error: ", err));

app.get("/", (req, res) => res.send("API running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
