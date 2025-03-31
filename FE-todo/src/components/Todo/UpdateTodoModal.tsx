import React, { useState } from "react";
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

interface UpdateTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTitle: string;
  onUpdate: (newTitle: string) => Promise<void>;
}

const UpdateTodoModal: React.FC<UpdateTodoModalProps> = ({
  isOpen,
  onClose,
  initialTitle,
  onUpdate,
}) => {
  const [newTitle, setNewTitle] = useState(initialTitle);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    if (!newTitle.trim()) return;

    setIsLoading(true);
    try {
      await onUpdate(newTitle);
      toast.success("Cập nhật todo thành công!"); // 
      onClose();
    } catch (error) {
      console.error("Lỗi khi cập nhật todo:", error);
      toast.error("Cập nhật thất bại!"); // 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cập nhật Todo</DialogTitle>
        </DialogHeader>
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Nhập nội dung mới..."
        />
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
