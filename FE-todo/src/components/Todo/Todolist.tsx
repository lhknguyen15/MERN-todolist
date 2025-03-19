// src/components/TodoList.tsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import TodoCard from "./TodoCard";
import { useNavigate } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import { fetchTodos, deleteTodo } from "../../redux/slices/todoSlice";
import { AppDispatch, RootState } from "../../redux/store";

const TodoList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { todos, loading, error } = useSelector(
    (state: RootState) => state.todos
  );
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchTodos());
  }, [dispatch]);

  const handleEdit = (id: string) => {
    // Điều hướng đến trang chỉnh sửa, bạn có thể tạo trang edit riêng
    navigate(`/edit/${id}`);
  };

  const handleDelete = (id: string) => {
    dispatch(deleteTodo(id));
  };

  return (
    <div className="relative min-h-screen">
      {loading && <p className="text-center">Đang tải...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-6">
        {todos.map((todo) => (
          <TodoCard
            key={todo.id}
            id={todo.id}
            title={todo.title}
            completed={todo.completed}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
      {/* Floating "Tạo mới" button ở góc phải */}
      <button
        onClick={() => navigate("/create")}
        className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700"
      >
        <FiPlus size={24} />
      </button>
    </div>
  );
};

export default TodoList;
