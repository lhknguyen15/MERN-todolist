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
import { Textarea } from "../ui/textarea";
import { TodoPriority } from "../../types/todo";
import { Category } from "../../types/category";

interface AddTodoModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  categories?: Category[];
  canAssignCategory?: boolean;
  onAdd: (title: string, description: string, priority: TodoPriority, startDate: string | null, dueDate: string | null, categoryId: string | null) => Promise<void>;
}

const AddTodoModal: React.FC<AddTodoModalProps> = ({ isOpen, setIsOpen, onAdd, categories = [], canAssignCategory = false }) => {
  const [todoTitle, setTodoTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TodoPriority>("medium");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTodoTitle("");
      setDescription("");
      setPriority("medium");
      setStartDate("");
      setDueDate("");
      setCategoryId("");
    }
  }, [isOpen]);

  const handleAddTodo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = todoTitle.trim();
    if (!title || loading || (startDate && dueDate && startDate > dueDate)) return;

    setLoading(true);
    try {
      await onAdd(title, description.trim(), priority, startDate || null, dueDate || null, categoryId || null);
      setTodoTitle("");
      setDescription("");
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
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl border-slate-200 p-6 sm:max-w-md">
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
              aria-describedby="todo-title-count"
              placeholder="Ví dụ: Hoàn thành báo cáo tuần"
              value={todoTitle}
              onChange={(event) => setTodoTitle(event.target.value)}
              disabled={loading}
            />
            <p id="todo-title-count" className={`text-right text-xs ${todoTitle.length >= 270 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}>
              {todoTitle.length}/300 ký tự{todoTitle.length >= 270 && " — Tiêu đề sắp đạt giới hạn"}
            </p>
          </div>
          <div className="space-y-2">
            <label htmlFor="todo-description" className="text-sm font-medium text-slate-700 dark:text-muted-foreground">
              Ghi chú <span className="font-normal text-muted-foreground">(tùy chọn)</span>
            </label>
            <Textarea
              id="todo-description"
              value={description}
              maxLength={3000}
              aria-describedby="todo-description-count"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Thêm thông tin hoặc hướng dẫn chi tiết..."
              disabled={loading}
              className="min-h-28 resize-y"
            />
            <p id="todo-description-count" className={`text-right text-xs ${description.length >= 2700 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}>
              {description.length}/3000 ký tự{description.length >= 2700 && " — Ghi chú sắp đạt giới hạn"}
            </p>
          </div>
          {canAssignCategory && (
            <div className="space-y-2">
              <label htmlFor="todo-category" className="text-sm font-medium text-slate-700 dark:text-muted-foreground">Danh mục</label>
              <select id="todo-category" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} disabled={loading} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/20 disabled:opacity-50">
                <option value="">Chưa phân loại</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              {categories.length === 0 && <p className="text-xs text-muted-foreground">Tạo danh mục trong mục Danh mục của dashboard.</p>}
            </div>
          )}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="todo-start-date" className="text-sm font-medium text-slate-700 dark:text-muted-foreground">
                Ngày bắt đầu <span className="font-normal text-muted-foreground">(tùy chọn)</span>
              </label>
              <Input
                id="todo-start-date"
                type="date"
                value={startDate}
                max={dueDate || undefined}
                onChange={(event) => setStartDate(event.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="todo-due-date" className="text-sm font-medium text-slate-700 dark:text-muted-foreground">
                Hạn hoàn thành <span className="font-normal text-muted-foreground">(tùy chọn)</span>
              </label>
              <Input
                id="todo-due-date"
                type="date"
                value={dueDate}
                min={startDate || undefined}
                onChange={(event) => setDueDate(event.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          {startDate && dueDate && startDate > dueDate && (
            <p role="alert" className="text-sm text-destructive">Ngày bắt đầu phải trước hoặc trùng hạn hoàn thành.</p>
          )}
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
              disabled={!todoTitle.trim() || loading || Boolean(startDate && dueDate && startDate > dueDate)}
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
