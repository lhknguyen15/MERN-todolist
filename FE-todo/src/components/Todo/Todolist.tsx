import { useEffect, useState } from "react";
import axiosClient from "../../apis/axiosClient";
import TodoCard from "./TodoCard";

interface Todo {
  _id: string;
  title: string;
  completed: boolean;
}
interface TodoListProps {
  refresh: boolean; // Nhận prop từ Home.tsx
}
const Todolist: React.FC<TodoListProps> = ({ refresh }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch danh sách todo
  useEffect(() => {
    const fetchTodos = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get<Todo[]>("/todos");
        setTodos(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách todo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, [refresh]);

  // Hàm cập nhật trạng thái hoàn thành
  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      await axiosClient.put(`/todos/${id}`, { completed });
      setTodos((prev) =>
        prev.map((todo) => (todo._id === id ? { ...todo, completed } : todo))
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái todo:", error);
    }
  };

  // Hàm cập nhật tiêu đề todo
  const handleEditTodo = async (id: string, newTitle: string) => {
    try {
      await axiosClient.put(`/todos/${id}`, { title: newTitle });
      setTodos((prev) =>
        prev.map((todo) =>
          todo._id === id ? { ...todo, title: newTitle } : todo
        )
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật todo:", error);
    }
  };

  // Hàm xóa todo
  const handleDeleteTodo = async (id: string) => {
    try {
      await axiosClient.delete(`/todos/${id}`);
      setTodos((prev) => prev.filter((todo) => todo._id !== id));
    } catch (error) {
      console.error("Lỗi khi xóa todo:", error);
    }
  };

  return (
    <div className="p-4">
      {loading ? (
        <p className="text-center text-gray-500">Đang tải...</p>
      ) : todos.length === 0 ? (
        <p className="text-center text-gray-500">Chưa có todo nào.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {todos.map((todo) => (
            <TodoCard
              key={todo._id}
              id={todo._id}
              title={todo.title}
              completed={todo.completed}
              onEdit={handleEditTodo}
              onDelete={handleDeleteTodo}
              onToggleComplete={handleToggleComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Todolist;
