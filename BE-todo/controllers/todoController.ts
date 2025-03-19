import { Request, Response } from "express";
import Todo from "../models/Todo";

export const createTodo = async (req: Request, res: Response) => {
  const { title } = req.body;
  const userId = (req as any).user.id;
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
// Cập nhật Todo
export const updateTodo = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const userId = (req as any).user.id;
  try {
    // Tìm Todo theo id và userId để đảm bảo chỉ user sở hữu mới được chỉnh sửa
    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: id, userId },
      req.body,
      { new: true } // trả về document đã được cập nhật
    );
    if (!updatedTodo) {
      return res.status(404).json({ error: "Todo không tồn tại" });
    }
    res.json(updatedTodo);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Xóa Todo
export const deleteTodo = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const userId = (req as any).user.id;
  try {
    // Xóa Todo chỉ khi nó thuộc về user hiện tại
    const deletedTodo = await Todo.findOneAndDelete({ _id: id, userId });
    if (!deletedTodo) {
      return res.status(404).json({ error: "Todo không tồn tại" });
    }
    res.json({ message: "Xóa Todo thành công" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
