"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const todoController_1 = require("../controllers/todoController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.post("/", authMiddleware_1.authenticateToken, todoController_1.createTodo);
router.get("/", authMiddleware_1.authenticateToken, todoController_1.getTodos);
router.put("/:id", authMiddleware_1.authenticateToken, todoController_1.updateTodo);
router.delete("/:id", authMiddleware_1.authenticateToken, todoController_1.deleteTodo);
exports.default = router;
