import { GuestTodo, TodoPriority } from "../types/todo";
import { Category, CategoryColor } from "../types/category";
import { isDateOnly } from "../utils/dateOnly";

const storageKey = "todos:guest:v1";
const categoryStorageKey = "todos:guest-categories:v1";
const validCategoryColors: CategoryColor[] = ["emerald", "blue", "violet", "amber", "rose", "slate"];

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
      const startDate = isDateOnly(todo.startDate) ? todo.startDate : null;
      const dueDate = isDateOnly(todo.dueDate) ? todo.dueDate : null;
      const categoryId = typeof todo.categoryId === "string" ? todo.categoryId : null;
      const description = typeof todo.description === "string" && todo.description.length <= 3000
        ? todo.description
        : "";
      return [{ id: todo.id, title: todo.title, description, completed: todo.completed, priority, startDate, dueDate, categoryId }];
    });
  } catch {
    return [];
  }
};

export const readGuestCategories = (): Category[] => {
  try {
    const value = localStorage.getItem(categoryStorageKey);
    if (!value) return [];
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((category): Category[] => {
      if (
        typeof category !== "object" || category === null ||
        typeof category.id !== "string" || typeof category.name !== "string" ||
        !validCategoryColors.includes(category.color)
      ) return [];
      const name = category.name.trim();
      if (!name || name.length > 40) return [];
      return [{ id: category.id, name, color: category.color }];
    });
  } catch {
    return [];
  }
};

export const writeGuestCategories = (categories: Category[]): void => {
  localStorage.setItem(categoryStorageKey, JSON.stringify(categories));
};

export const writeGuestTodos = (todos: GuestTodo[]): void => {
  localStorage.setItem(storageKey, JSON.stringify(todos));
};

export const clearGuestTodos = (): void => {
  localStorage.removeItem(storageKey);
};
