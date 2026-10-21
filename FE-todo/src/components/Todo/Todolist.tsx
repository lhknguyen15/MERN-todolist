import { Search, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import TodoCard from "./TodoCard";
import { Todo } from "../../types/todo";
import { TodoPriority } from "../../types/todo";
import { Category } from "../../types/category";
import { Card, CardContent } from "../ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";

interface TodoListProps {
  todos: Todo[];
  loading: boolean;
  hasTodos: boolean;
  searchTerm: string;
  resetKey: string;
  categories?: Category[];
  guestCategories?: Category[];
  canAssignCategory?: boolean;
  canAssignGuestCategory?: boolean;
  onEdit: (id: string, newTitle: string, description: string, priority: TodoPriority, startDate: string | null, dueDate: string | null, categoryId: string | null) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleComplete: (id: string, completed: boolean) => Promise<void>;
}

const TodoList: React.FC<TodoListProps> = ({
  todos,
  loading,
  hasTodos,
  searchTerm,
  resetKey,
  categories = [],
  guestCategories = [],
  canAssignCategory = false,
  canAssignGuestCategory = false,
  onEdit,
  onDelete,
  onToggleComplete,
}) => {
  const pageSize = 9;
  const [currentPage, setCurrentPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(todos.length / pageSize));

  useEffect(() => setCurrentPage(1), [resetKey]);
  useEffect(() => {
    setCurrentPage((page) => Math.min(page, pageCount));
  }, [pageCount]);

  if (loading) {
    return (
      <Card className="border-slate-100 bg-card py-16 text-center shadow-sm dark:border-border">
        <CardContent>
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-500" />
        <p className="text-sm text-slate-500 dark:text-muted-foreground">Đang tải danh sách việc cần làm...</p>
        </CardContent>
      </Card>
    );
  }

  if (todos.length === 0) {
    const emptyTitle = hasTodos
      ? searchTerm
        ? "Không tìm thấy việc phù hợp"
        : "Chưa có việc nào trong mục này"
      : "Bắt đầu với việc đầu tiên";
    const emptyDescription = hasTodos
      ? searchTerm
        ? `Không có việc nào khớp với “${searchTerm}”. Thử từ khóa khác nhé.`
        : "Các việc khớp với bộ lọc này sẽ xuất hiện ở đây."
      : "Ghi lại một việc bạn muốn hoàn thành. Danh sách sẽ được lưu tự động.";

    return (
      <Card className="border-dashed border-emerald-200 bg-card py-16 text-center shadow-none dark:border-emerald-900">
        <CardContent>
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          {hasTodos ? <Search size={25} /> : <Sparkles size={25} />}
        </span>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-card-foreground">{emptyTitle}</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-muted-foreground">{emptyDescription}</p>
        </CardContent>
      </Card>
    );
  }

  const pageTodos = todos.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const firstItem = (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, todos.length);
  let pageItems: (number | "ellipsis")[];
  if (pageCount <= 5) {
    pageItems = Array.from({ length: pageCount }, (_, index) => index + 1);
  } else if (currentPage <= 3) {
    pageItems = [1, 2, 3, 4, "ellipsis", pageCount];
  } else if (currentPage >= pageCount - 2) {
    pageItems = [1, "ellipsis", pageCount - 3, pageCount - 2, pageCount - 1, pageCount];
  } else {
    pageItems = [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", pageCount];
  }

  return (
    <>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Danh sách việc cần làm">
      {pageTodos.map((todo) => {
        const todoCategories = todo.source === "guest" ? guestCategories : categories;
        return (
        <li key={todo.id}>
          <TodoCard
            id={todo.id}
            title={todo.title}
            description={todo.description}
            completed={todo.completed}
            priority={todo.priority}
            startDate={todo.startDate}
            dueDate={todo.dueDate}
            category={todoCategories.find((category) => category.id === todo.categoryId)}
            categories={todoCategories}
            canAssignCategory={todo.source === "guest" ? canAssignGuestCategory : canAssignCategory}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleComplete={onToggleComplete}
          />
        </li>
        );
      })}
      </ul>
      {todos.length > pageSize && (
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-card px-4 py-3 text-card-foreground sm:flex-row sm:items-center sm:justify-between dark:border-border">
          <p className="text-sm text-slate-500 dark:text-muted-foreground">Hiển thị {firstItem}–{lastItem} trong {todos.length} công việc</p>
          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  aria-disabled={currentPage === 1}
                  className={currentPage === 1 ? "pointer-events-none opacity-40" : ""}
                  onClick={(event) => {
                    event.preventDefault();
                    setCurrentPage((page) => Math.max(1, page - 1));
                  }}
                />
              </PaginationItem>
              {pageItems.map((pageItem, index) => (
                <PaginationItem key={`${pageItem}-${index}`}>
                  {pageItem === "ellipsis" ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      href="#"
                      isActive={currentPage === pageItem}
                      onClick={(event) => {
                        event.preventDefault();
                        setCurrentPage(pageItem);
                      }}
                    >
                      {pageItem}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  aria-disabled={currentPage === pageCount}
                  className={currentPage === pageCount ? "pointer-events-none opacity-40" : ""}
                  onClick={(event) => {
                    event.preventDefault();
                    setCurrentPage((page) => Math.min(pageCount, page + 1));
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  );
};

export default TodoList;
