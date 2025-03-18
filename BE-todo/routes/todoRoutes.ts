import { Router } from "express";
import { createTodo, getTodos } from "../controllers/todoController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authenticateToken, createTodo);
router.get("/", authenticateToken, getTodos);

export default router;
