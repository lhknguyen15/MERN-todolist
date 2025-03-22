import { useEffect, useState } from "react";
import axiosClient from "../../apis/axiosClient";

interface Todo {
  _id: string;
  title: string;
  completed: boolean;
}

const Todolist = () => {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await axiosClient.get<Todo[]>("/todos");
        setTodos(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách todo:", error);
      }
    };

    fetchTodos();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {todos.map((todo) => (
        <div
          key={todo._id}
          className="bg-white shadow-lg rounded-lg p-4 border"
        >
          <h3 className="text-xl font-bold">{todo.title}</h3>
          <label className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={todo.completed}
              readOnly
              className="w-4 h-4"
            />
            <span
              className={todo.completed ? "text-green-500" : "text-red-500"}
            >
              {todo.completed ? "Hoàn thành" : "Chưa hoàn thành"}
            </span>
          </label>
        </div>
      ))}
    </div>
  );
};

export default Todolist;
