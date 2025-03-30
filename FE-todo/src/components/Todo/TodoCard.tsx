import React, { useState } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import UpdateTodoModal from "./UpdateTodoModal";
import DeleteTodoModal from "./DeleteTodoModal";

interface TodoCardProps {
  id: string;
  title: string;
  completed: boolean;
  onEdit: (id: string, newTitle: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleComplete: (id: string, completed: boolean) => void;
}

const TodoCard: React.FC<TodoCardProps> = ({
  id,
  title,
  completed,
  onEdit,
  onDelete,
  onToggleComplete,
}) => {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <div className="relative p-4 bg-white shadow-lg rounded-lg border">
      {/* Tiêu đề todo */}
      <h2 className="text-lg font-semibold mb-2">{title}</h2>

      {/* Hàng chứa nút update, delete (bên trái) & checkbox (bên phải) */}
      <div className="flex justify-between items-center">
        {/* Nút update và delete */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsUpdateOpen(true)}
            className="text-blue-500 hover:text-blue-700"
          >
            <FiEdit size={22} />
          </button>
          <button
            onClick={() => setIsDeleteOpen(true)}
            className="text-red-500 hover:text-red-700"
          >
            <FiTrash2 size={22} />
          </button>
        </div>

        {/* Checkbox và trạng thái */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={completed}
            onChange={() => onToggleComplete(id, !completed)}
            className="w-4 h-4 accent-green-500"
          />
          <span className={completed ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
            {completed ? "Hoàn thành" : "Chưa hoàn thành"}
          </span>
        </label>
      </div>

      {/* Dialog cập nhật Todo */}
      <UpdateTodoModal
        isOpen={isUpdateOpen}
        onClose={() => setIsUpdateOpen(false)}
        initialTitle={title}
        onUpdate={(newTitle) => onEdit(id, newTitle)}
      />

      {/* Dialog xác nhận xóa */}
      <DeleteTodoModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => onDelete(id)}
      />
    </div>
  );
};

export default TodoCard;
