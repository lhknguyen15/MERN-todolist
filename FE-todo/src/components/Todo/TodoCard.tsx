// src/components/TodoCard.tsx
import React from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";

interface TodoCardProps {
  id: string;
  title: string;
  completed: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const TodoCard: React.FC<TodoCardProps> = ({
  id,
  title,
  completed,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="relative p-4 bg-white dark:bg-gray-700 shadow-lg rounded-lg">
      <h2 className="text-lg font-semibold dark:text-white">{title}</h2>
      <p className="text-gray-600 dark:text-gray-300">
        {completed ? "Hoàn thành" : "Chưa hoàn thành"}
      </p>
      {/* Nút chỉnh sửa và xóa bên trong card */}
      <div className="absolute top-2 right-2 flex gap-2">
        <button
          onClick={() => onEdit(id)}
          className="text-blue-500 hover:text-blue-700"
        >
          <FiEdit size={18} />
        </button>
        <button
          onClick={() => onDelete(id)}
          className="text-red-500 hover:text-red-700"
        >
          <FiTrash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default TodoCard;
