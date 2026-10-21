export type TodoPriority = "low" | "medium" | "high";

export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: TodoPriority;
  startDate: string | null;
  dueDate: string | null;
  categoryId: string | null;
  source: "guest" | "account";
}

export interface GuestTodo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: TodoPriority;
  startDate?: string | null;
  dueDate?: string | null;
  categoryId?: string | null;
}

export interface ApiTodo {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority?: TodoPriority;
  startDate?: string | null;
  dueDate?: string | null;
  categoryId?: string | null;
}

export const mapApiTodo = (todo: ApiTodo): Todo => ({
  id: todo._id,
  title: todo.title,
  description: todo.description ?? "",
  completed: todo.completed,
  priority: todo.priority ?? "medium",
  startDate: todo.startDate ?? null,
  dueDate: todo.dueDate ?? null,
  categoryId: todo.categoryId ?? null,
  source: "account",
});
