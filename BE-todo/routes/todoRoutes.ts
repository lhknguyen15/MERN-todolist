import { Router } from "express";
import { createTodo, deleteTodo, getTodos, updateTodo } from "../controllers/todoController";
import { authenticateToken } from "../middlewares/authMiddleware";
import { verifyCsrfToken } from "../middlewares/csrfMiddleware";

const router = Router();

router.post("/", authenticateToken, verifyCsrfToken, createTodo);
router.get("/", authenticateToken, getTodos);
router.put("/:id", authenticateToken, verifyCsrfToken, updateTodo);
router.delete("/:id", authenticateToken, verifyCsrfToken, deleteTodo);

export default router;
