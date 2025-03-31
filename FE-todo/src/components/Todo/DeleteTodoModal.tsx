import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

interface DeleteTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const DeleteTodoModal: React.FC<DeleteTodoModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      toast.success("Xóa todo thành công!"); 
      onClose();
    } catch (error) {
      console.error("Lỗi khi xóa todo:", error);
      toast.error("Xóa todo thất bại!"); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bạn có chắc chắn muốn xóa?</DialogTitle>
        </DialogHeader>
        <p className="text-gray-600">Hành động này không thể hoàn tác!</p>
        <div className="flex justify-end gap-2 mt-4">
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>
              Hủy
            </Button>
          </DialogClose>
          <Button
            className="bg-red-500 hover:bg-red-700 text-white flex items-center gap-2"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="animate-spin w-4 h-4" />}
            Xóa
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTodoModal;
