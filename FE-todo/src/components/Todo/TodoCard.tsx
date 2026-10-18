import React, { useState } from "react";
import { Check, Pencil, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import UpdateTodoModal from "./UpdateTodoModal";
import DeleteTodoModal from "./DeleteTodoModal";
import { TodoPriority } from "../../types/todo";

interface TodoCardProps {
  id: string;
  title: string;
  completed: boolean;
  priority: TodoPriority;
  onEdit: (id: string, newTitle: string, priority: TodoPriority) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleComplete: (id: string, completed: boolean) => Promise<void>;
}

const TodoCard: React.FC<TodoCardProps> = ({
  id,
  title,
  completed,
  priority,
  onEdit,
  onDelete,
  onToggleComplete,
}) => {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const priorityStyles: Record<TodoPriority, string> = {
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    medium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    low: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
  };
  const priorityCardStyles: Record<TodoPriority, string> = {
    high: "border-red-200 border-l-4 border-l-red-500 bg-red-50/80 hover:border-red-300 dark:border-red-800 dark:border-l-red-400 dark:bg-red-950/60 dark:hover:border-red-700",
    medium: "border-amber-200 border-l-4 border-l-amber-500 bg-amber-50/80 hover:border-amber-300 dark:border-amber-800 dark:border-l-amber-400 dark:bg-amber-950/60 dark:hover:border-amber-700",
    low: "border-slate-200 border-l-4 border-l-slate-400 bg-slate-50 hover:border-slate-300 dark:border-slate-700 dark:border-l-slate-400 dark:bg-slate-800/80 dark:hover:border-slate-600",
  };
  const priorityLabels: Record<TodoPriority, string> = {
    high: "Ưu tiên cao",
    medium: "Ưu tiên trung bình",
    low: "Ưu tiên thấp",
  };

  return (
    <Card className={`group h-full min-h-48 gap-0 p-0 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${priorityCardStyles[priority]}`}>
      <CardContent className="flex flex-1 flex-col p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${completed ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}>
            {completed ? "Đã hoàn thành" : "Chưa hoàn thành"}
          </span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityStyles[priority]}`}>
            {priorityLabels[priority]}
          </span>
        </div>
        <Button
          type="button"
          role="checkbox"
          aria-checked={completed}
          onClick={() => onToggleComplete(id, !completed)}
          aria-label={completed ? `Đánh dấu chưa xong: ${title}` : `Hoàn thành: ${title}`}
          variant="outline"
          size="icon"
          className={`size-6 rounded-full p-0 ${completed ? "border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600 hover:text-white" : "border-slate-300 bg-white text-transparent hover:border-emerald-500 hover:bg-emerald-50 dark:border-slate-600 dark:bg-background dark:hover:bg-emerald-950"}`}
        >
          <Check size={12} strokeWidth={3} />
        </Button>
      </div>

      <h2 className={`flex-1 break-words text-base font-semibold leading-6 ${completed ? "text-slate-400 line-through dark:text-muted-foreground" : "text-slate-800 dark:text-card-foreground"}`}>
        {title}
      </h2>
      </CardContent>

      <CardFooter className="justify-end gap-1 border-t border-slate-100 px-5 py-3 dark:border-border">
        <Button
          onClick={() => setIsUpdateOpen(true)}
          aria-label={`Sửa: ${title}`}
          variant="ghost"
          size="icon"
          className="text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 dark:text-muted-foreground dark:hover:bg-emerald-950 dark:hover:text-emerald-300"
        >
          <Pencil size={18} />
        </Button>
        <Button
          onClick={() => setIsDeleteOpen(true)}
          aria-label={`Xóa: ${title}`}
          variant="ghost"
          size="icon"
          className="text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-300"
        >
          <Trash2 size={18} />
        </Button>
      </CardFooter>

      {/* Dialog cập nhật Todo */}
      <UpdateTodoModal
        isOpen={isUpdateOpen}
        onClose={() => setIsUpdateOpen(false)}
        initialTitle={title}
        initialPriority={priority}
        onUpdate={(newTitle, newPriority) => onEdit(id, newTitle, newPriority)}
      />

      {/* Dialog xác nhận xóa */}
      <DeleteTodoModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => onDelete(id)}
      />
    </Card>
  );
};

export default TodoCard;
