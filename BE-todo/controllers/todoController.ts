import { Request, Response } from "express";
import Todo from "../models/Todo";

export const createTodo = async (req: Request, res: Response) => {
  const { title } = req.body;
  const userId = (res as any).user.id;
  try {
    const todo = new Todo({ userId, title });
    await todo.save();
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getTodos = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  try {
    const todos = await Todo.find({ userId });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
