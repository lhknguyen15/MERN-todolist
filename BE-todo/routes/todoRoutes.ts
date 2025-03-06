import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import { createTodo, getTodos } from "../controllers/todoController";

const router = Router()

router.post("/", authenticateToken, createTodo);
router.get("/", authenticateToken, getTodos);



export default router;
