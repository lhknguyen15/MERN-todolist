import { GuestTodo, TodoPriority } from "../types/todo";

const storageKey = "todos:guest:v1";

export const readGuestTodos = (): GuestTodo[] => {
  try {
    const value = localStorage.getItem(storageKey);
    if (!value) return [];

    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((todo): GuestTodo[] => {
      if (
        typeof todo !== "object" ||
        todo === null ||
        typeof todo.id !== "string" ||
        typeof todo.title !== "string" ||
        typeof todo.completed !== "boolean"
      ) {
        return [];
      }

      const priority: TodoPriority =
        todo.priority === "low" || todo.priority === "high" || todo.priority === "medium"
          ? todo.priority
          : "medium";
      return [{ id: todo.id, title: todo.title, completed: todo.completed, priority }];
    });
  } catch {
    return [];
  }
};

export const writeGuestTodos = (todos: GuestTodo[]): void => {
  localStorage.setItem(storageKey, JSON.stringify(todos));
};

export const clearGuestTodos = (): void => {
  localStorage.removeItem(storageKey);
};
