import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { TodoPriority } from "../../types/todo";

interface UpdateTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTitle: string;
  initialPriority: TodoPriority;
  onUpdate: (newTitle: string, priority: TodoPriority) => Promise<void>;
}

const UpdateTodoModal: React.FC<UpdateTodoModalProps> = ({
  isOpen,
  onClose,
  initialTitle,
  initialPriority,
  onUpdate,
}) => {
  const [newTitle, setNewTitle] = useState(initialTitle);
  const [priority, setPriority] = useState(initialPriority);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNewTitle(initialTitle);
      setPriority(initialPriority);
    }
  }, [initialPriority, initialTitle, isOpen]);

  const handleUpdate = async () => {
    if (!newTitle.trim()) return;

    setIsLoading(true);
    try {
      await onUpdate(newTitle, priority);
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cập nhật công việc</DialogTitle>
        </DialogHeader>
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Nhập nội dung mới..."
        />
        <div className="mt-4 space-y-2">
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
        <div className="flex justify-end gap-2 mt-4">
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>
              Hủy
            </Button>
          </DialogClose>
          <Button
            className="bg-green-500 hover:bg-green-700 text-white flex items-center gap-2"
            onClick={handleUpdate}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="animate-spin w-4 h-4" />}
            Cập nhật
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateTodoModal;
