import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import axiosClient from "../../apis/axiosClient";
import { toast } from "react-toastify";

interface AddTodoModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onTodoAdded: () => void;
}

const AddTodoModal: React.FC<AddTodoModalProps> = ({
  isOpen,
  setIsOpen,
  onTodoAdded,
}) => {
  const [todoTitle, setTodoTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddTodo = async () => {
    if (!todoTitle.trim()) return;

    setLoading(true);
    try {
      await axiosClient.post("/todos", { title: todoTitle });
      setTodoTitle("");
      setIsOpen(false);
      onTodoAdded(); // Gọi callback để cập nhật danh sách todo
      toast.success("Thêm todo thành công!");
    } catch (error) {
      console.error("Lỗi khi thêm todo:", error);
      toast.error("Thêm todo thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm Todo mới</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Nhập tên todo..."
          value={todoTitle}
          onChange={(e) => setTodoTitle(e.target.value)}
          disabled={loading}
        />
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            className="bg-green-500 hover:bg-green-700 cursor-pointer"
            onClick={handleAddTodo}
            disabled={loading}
          >
            {loading ? "Đang thêm..." : "Thêm"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddTodoModal;
