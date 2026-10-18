import { Request, Response } from "express";
import Todo from "../models/Todo";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const createTodo = async (req: Request, res: Response): Promise<void> => {
  const body = req.body;
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body) ||
    typeof body.title !== "string" ||
    !body.title.trim()
  ) {
    res.status(400).json({ error: "Title must be a non-empty string" });
    return;
  }

  const priority = body.priority ?? "medium";
  if (priority !== "low" && priority !== "medium" && priority !== "high") {
    res.status(400).json({ error: "Priority must be low, medium, or high" });
    return;
  }

  const title = body.title.trim();
  const userId = (req as any).user.id;
  try {
    const todo = new Todo({ userId, title, priority });
    await todo.save();
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const importGuestTodos = async (
  req: Request,
  res: Response
): Promise<void> => {
  const body: unknown = req.body;
  if (!isRecord(body) || !Array.isArray(body.todos) || body.todos.length > 500) {
    res.status(400).json({ error: "Invalid todo import data" });
    return;
  }

  const todosByClientId = new Map<
    string,
    { clientId: string; title: string; completed: boolean; priority: "low" | "medium" | "high" }
  >();

  for (const item of body.todos) {
    if (!isRecord(item)) {
      res.status(400).json({ error: "Invalid todo import data" });
      return;
    }

    const { clientId, title, completed } = item;
    const priority = item.priority ?? "medium";
    if (
      typeof clientId !== "string" ||
      !clientId.trim() ||
      clientId.length > 100 ||
      typeof title !== "string" ||
      !title.trim() ||
      (completed !== undefined && typeof completed !== "boolean") ||
      (priority !== "low" && priority !== "medium" && priority !== "high")
    ) {
      res.status(400).json({ error: "Invalid todo import data" });
      return;
    }

    todosByClientId.set(clientId, {
      clientId,
      title: title.trim(),
      completed: completed === true,
      priority,
    });
  }

  if (todosByClientId.size === 0) {
    res.json({ imported: 0 });
    return;
  }

  const userId = (req as any).user.id;
  try {
    await Todo.bulkWrite(
      [...todosByClientId.values()].map((todo) => ({
        updateOne: {
          filter: { userId, clientId: todo.clientId },
          update: {
            $set: { title: todo.title, completed: todo.completed, priority: todo.priority },
            $setOnInsert: { userId, clientId: todo.clientId },
          },
          upsert: true,
        },
      }))
    );
    const importedTodos = await Todo.find({
      userId,
      clientId: { $in: [...todosByClientId.keys()] },
    });
    res.json({ imported: importedTodos.length, todos: importedTodos });
  } catch {
    res.status(500).json({ error: "Could not import todos" });
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
    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({ error: "Invalid update data" });
    }

    const allowedFields = ["title", "completed", "priority"];
    if (Object.keys(body).some((field) => !allowedFields.includes(field))) {
      return res.status(400).json({ error: "Unsupported update field" });
    }

    const updates: { title?: string; completed?: boolean; priority?: "low" | "medium" | "high" } = {};
    if ("title" in body) {
      if (typeof body.title !== "string" || !body.title.trim()) {
        return res.status(400).json({ error: "Title must be a non-empty string" });
      }
      updates.title = body.title.trim();
    }

    if ("completed" in body) {
      if (typeof body.completed !== "boolean") {
        return res.status(400).json({ error: "Completed must be a boolean" });
      }
      updates.completed = body.completed;
    }

    if ("priority" in body) {
      if (body.priority !== "low" && body.priority !== "medium" && body.priority !== "high") {
        return res.status(400).json({ error: "Priority must be low, medium, or high" });
      }
      updates.priority = body.priority;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No update fields provided" });
    }

    // Tìm Todo theo id và userId để đảm bảo chỉ user sở hữu mới được chỉnh sửa
    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: id, userId },
      { $set: updates },
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
