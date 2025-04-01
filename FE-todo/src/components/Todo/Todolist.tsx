import { useEffect, useState } from "react";
import axiosClient from "../../apis/axiosClient";
import TodoCard from "./TodoCard";
import { Button } from "../ui/button";

interface Todo {
  _id: string;
  title: string;
  completed: boolean;
}

interface TodoListProps {
  refresh: boolean;
  searchTerm: string;
}

const todosPerPage = 9;

const TodoList: React.FC<TodoListProps> = ({ refresh, searchTerm }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    const fetchTodos = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get<Todo[]>("/todos?limit=150");
        setTodos(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách todo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, [refresh]);

  // Lọc danh sách todo theo từ khóa tìm kiếm
  const filteredTodos = todos.filter((todo) =>
    todo.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Tính lại số trang dựa trên kết quả tìm kiếm
  const totalPages = Math.ceil(filteredTodos.length / todosPerPage);

  // Cập nhật trang về 1 khi searchTerm thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Lọc danh sách theo trang hiện tại
  const paginatedTodos = filteredTodos.slice(
    (currentPage - 1) * todosPerPage,
    currentPage * todosPerPage
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Hàm cập nhật trạng thái hoàn thành
  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      await axiosClient.put(`/todos/${id}`, { completed });
      setTodos((prev) =>
        prev.map((todo) => (todo._id === id ? { ...todo, completed } : todo))
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái todo:", error);
    }
  };

  // Hàm cập nhật tiêu đề todo
  const handleEditTodo = async (id: string, newTitle: string) => {
    try {
      await axiosClient.put(`/todos/${id}`, { title: newTitle });
      setTodos((prev) =>
        prev.map((todo) =>
          todo._id === id ? { ...todo, title: newTitle } : todo
        )
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật todo:", error);
    }
  };

  // Hàm xóa todo
  const handleDeleteTodo = async (id: string) => {
    try {
      await axiosClient.delete(`/todos/${id}`);
      setTodos((prev) => prev.filter((todo) => todo._id !== id));
    } catch (error) {
      console.error("Lỗi khi xóa todo:", error);
    }
  };

  return (
    <div className="p-4">
      {loading ? (
        <p className="text-center text-gray-500">Đang tải...</p>
      ) : filteredTodos.length === 0 ? (
        <p className="text-center text-gray-500">Không tìm thấy kết quả.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedTodos.map((todo) => (
              <TodoCard
                key={todo._id}
                id={todo._id}
                title={todo.title}
                completed={todo.completed}
                onEdit={handleEditTodo}
                onDelete={handleDeleteTodo}
                onToggleComplete={handleToggleComplete}
              />
            ))}
          </div>

          {/* Phân trang */}
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Trước
            </Button>
            <span className="font-semibold">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Tiếp
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default TodoList;
