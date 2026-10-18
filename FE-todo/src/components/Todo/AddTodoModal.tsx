import { FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { TodoPriority } from "../../types/todo";

interface AddTodoModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onAdd: (title: string, priority: TodoPriority) => Promise<void>;
}

const AddTodoModal: React.FC<AddTodoModalProps> = ({ isOpen, setIsOpen, onAdd }) => {
  const [todoTitle, setTodoTitle] = useState("");
  const [priority, setPriority] = useState<TodoPriority>("medium");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTodoTitle("");
      setPriority("medium");
    }
  }, [isOpen]);

  const handleAddTodo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = todoTitle.trim();
    if (!title || loading) return;

    setLoading(true);
    try {
      await onAdd(title, priority);
      setTodoTitle("");
      setIsOpen(false);
    } catch (error) {
      console.error("Lỗi khi thêm todo:", error);
      toast.error("Thêm công việc thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="rounded-2xl border-slate-200 p-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-foreground">Thêm công việc mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddTodo} className="mt-2 space-y-5">
          <div className="space-y-2">
            <label htmlFor="todo-title" className="text-sm font-medium text-slate-700 dark:text-muted-foreground">
              Nội dung công việc
            </label>
            <Input
              id="todo-title"
              autoFocus
              maxLength={300}
              placeholder="Ví dụ: Hoàn thành báo cáo tuần"
              value={todoTitle}
              onChange={(event) => setTodoTitle(event.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="todo-priority" className="text-sm font-medium text-slate-700 dark:text-muted-foreground">
              Mức độ ưu tiên
            </label>
            <select
              id="todo-priority"
              value={priority}
              onChange={(event) => setPriority(event.target.value as TodoPriority)}
              disabled={loading}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="high">Cao</option>
              <option value="medium">Trung bình</option>
              <option value="low">Thấp</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-emerald-500 text-white hover:bg-emerald-600"
              disabled={!todoTitle.trim() || loading}
            >
              {loading ? "Đang lưu..." : "Thêm công việc"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTodoModal;
