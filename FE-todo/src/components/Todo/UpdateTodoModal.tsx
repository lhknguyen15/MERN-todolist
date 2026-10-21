import React, { FormEvent, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TodoPriority } from "../../types/todo";
import { Category } from "../../types/category";

interface UpdateTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTitle: string;
  initialDescription: string;
  initialPriority: TodoPriority;
  initialStartDate: string | null;
  initialDueDate: string | null;
  initialCategoryId?: string | null;
  categories?: Category[];
  canAssignCategory?: boolean;
  onUpdate: (
    newTitle: string,
    description: string,
    priority: TodoPriority,
    startDate: string | null,
    dueDate: string | null,
    categoryId: string | null
  ) => Promise<void>;
}

const UpdateTodoModal: React.FC<UpdateTodoModalProps> = ({
  isOpen,
  onClose,
  initialTitle,
  initialDescription,
  initialPriority,
  initialStartDate,
  initialDueDate,
  initialCategoryId = null,
  categories = [],
  canAssignCategory = false,
  onUpdate,
}) => {
  const [newTitle, setNewTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [priority, setPriority] = useState(initialPriority);
  const [startDate, setStartDate] = useState(initialStartDate ?? "");
  const [dueDate, setDueDate] = useState(initialDueDate ?? "");
  const [categoryId, setCategoryId] = useState(initialCategoryId ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const invalidDateRange = Boolean(startDate && dueDate && startDate > dueDate);

  useEffect(() => {
    if (isOpen) {
      setNewTitle(initialTitle);
      setDescription(initialDescription);
      setPriority(initialPriority);
      setStartDate(initialStartDate ?? "");
      setDueDate(initialDueDate ?? "");
      setCategoryId(initialCategoryId ?? "");
    }
  }, [initialCategoryId, initialDescription, initialDueDate, initialPriority, initialStartDate, initialTitle, isOpen]);

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newTitle.trim() || invalidDateRange || isLoading) return;

    setIsLoading(true);
    try {
      await onUpdate(newTitle.trim(), description.trim(), priority, startDate || null, dueDate || null, categoryId || null);
      toast.success("Cập nhật công việc thành công!");
      onClose();
    } catch (error) {
      console.error("Lỗi khi cập nhật todo:", error);
      toast.error("Cập nhật thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle>Cập nhật công việc</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpdate} className="mt-2 space-y-4">
          <div className="space-y-2">
            <label htmlFor="update-todo-title" className="text-sm font-medium text-muted-foreground">
              Nội dung công việc
            </label>
            <Input
              id="update-todo-title"
              maxLength={300}
              aria-describedby="update-todo-title-count"
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              placeholder="Nhập nội dung mới..."
              disabled={isLoading}
            />
            <p id="update-todo-title-count" className={`text-right text-xs ${newTitle.length >= 270 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}>
              {newTitle.length}/300 ký tự{newTitle.length >= 270 && " — Tiêu đề sắp đạt giới hạn"}
            </p>
          </div>
          <div className="space-y-2">
            <label htmlFor="update-todo-description" className="text-sm font-medium text-muted-foreground">
              Ghi chú <span className="font-normal">(tùy chọn)</span>
            </label>
            <Textarea
              id="update-todo-description"
              value={description}
              maxLength={3000}
              aria-describedby="update-todo-description-count"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Thêm thông tin hoặc hướng dẫn chi tiết..."
              disabled={isLoading}
              className="min-h-28 resize-y"
            />
            <p id="update-todo-description-count" className={`text-right text-xs ${description.length >= 2700 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}>
              {description.length}/3000 ký tự{description.length >= 2700 && " — Ghi chú sắp đạt giới hạn"}
            </p>
          </div>
          {canAssignCategory && (
            <div className="space-y-2">
              <label htmlFor="update-todo-category" className="text-sm font-medium text-muted-foreground">Danh mục</label>
              <select id="update-todo-category" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} disabled={isLoading} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/20 disabled:opacity-50">
                <option value="">Chưa phân loại</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="update-todo-priority" className="text-sm font-medium text-muted-foreground">
              Mức độ ưu tiên
            </label>
            <select
              id="update-todo-priority"
              value={priority}
              onChange={(event) => setPriority(event.target.value as TodoPriority)}
              disabled={isLoading}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="high">Cao</option>
              <option value="medium">Trung bình</option>
              <option value="low">Thấp</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="update-todo-start-date" className="text-sm font-medium text-muted-foreground">
                Ngày bắt đầu
              </label>
              <Input
                id="update-todo-start-date"
                type="date"
                value={startDate}
                max={dueDate || undefined}
                onChange={(event) => setStartDate(event.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="update-todo-due-date" className="text-sm font-medium text-muted-foreground">
                Hạn hoàn thành
              </label>
              <Input
                id="update-todo-due-date"
                type="date"
                value={dueDate}
                min={startDate || undefined}
                onChange={(event) => setDueDate(event.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          {invalidDateRange && (
            <p role="alert" className="text-sm text-destructive">
              Ngày bắt đầu phải trước hoặc trùng hạn hoàn thành.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-emerald-500 text-white hover:bg-emerald-600"
              disabled={isLoading || !newTitle.trim() || invalidDateRange}
            >
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              Cập nhật
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateTodoModal;
