export type TodoPriority = "low" | "medium" | "high";

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: TodoPriority;
  source: "guest" | "account";
}

export interface GuestTodo {
  id: string;
  title: string;
  completed: boolean;
  priority: TodoPriority;
}

export interface ApiTodo {
  _id: string;
  title: string;
  completed: boolean;
  priority?: TodoPriority;
}

export const mapApiTodo = (todo: ApiTodo): Todo => ({
  id: todo._id,
  title: todo.title,
  completed: todo.completed,
  priority: todo.priority ?? "medium",
  source: "account",
});
