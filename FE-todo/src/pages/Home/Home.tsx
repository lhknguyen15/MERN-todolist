import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { CloudUpload, Plus } from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import axiosClient from "../../apis/axiosClient";
import {
  clearGuestTodos,
  readGuestTodos,
  readGuestCategories,
  writeGuestTodos,
  writeGuestCategories,
} from "../../apis/guestTodoStorage";
import TodoList from "../../components/Todo/Todolist";
import AddTodoModal from "../../components/Todo/AddTodoModal";
import { Button } from "../../components/ui/button";
import TodoFilterMenu from "../../components/Todo/TodoFilterMenu";
import { logout, setUser } from "../../redux/slices/authSlice";
import { RootState } from "../../redux/store";
import { ApiTodo, GuestTodo, mapApiTodo, Todo, TodoPriority } from "../../types/todo";
import { getLocalDateOnly } from "../../utils/dateOnly";
import NavBar from "./NavBar";
import DashboardLayout from "../Dashboard/DashboardLayout";
import DashboardOverview from "../Dashboard/DashboardOverview";
import AccountPanel from "../Dashboard/AccountPanel";
import CategoryManager from "../Dashboard/CategoryManager";
import { ApiCategory, Category, CategoryColor, mapApiCategory } from "../../types/category";

interface User {
  id: string;
  username: string;
  email: string;
}

type ViewFilter = "all" | "active" | "completed";
type DateFilter = "all" | "today" | "upcoming" | "overdue";
type DataMode = "checking" | "guest" | "account";

const readDarkPreference = () => {
  try {
    return window.localStorage.getItem("todos:theme") === "dark";
  } catch {
    return false;
  }
};

const toGuestView = (todo: GuestTodo): Todo => ({
  ...todo,
  description: todo.description ?? "",
  startDate: todo.startDate ?? null,
  dueDate: todo.dueDate ?? null,
  categoryId: todo.categoryId ?? null,
  source: "guest",
});

const mergeAccountTodos = (...groups: Todo[][]): Todo[] => {
  const byId = new Map<string, Todo>();
  groups.flat().forEach((todo) => byId.set(todo.id, todo));
  return [...byId.values()];
};

const isUnauthorized = (error: unknown): boolean =>
  axios.isAxiosError(error) && error.response?.status === 401;

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isDashboard = location.pathname.startsWith("/dashboard");
  const user = useSelector((state: RootState) => state.auth.user);
  const [mode, setMode] = useState<DataMode>("guest");
  const [todos, setTodos] = useState<Todo[]>(() => readGuestTodos().map(toGuestView));
  const [categories, setCategories] = useState<Category[]>([]);
  const [guestCategories, setGuestCategories] = useState<Category[]>(readGuestCategories);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddTodoOpen, setIsAddTodoOpen] = useState(false);
  const [filter, setFilter] = useState<ViewFilter>("all");
  const [connectionMessage, setConnectionMessage] = useState<string | null>(null);
  const [syncError, setSyncError] = useState(false);
  const [isDark, setIsDark] = useState(readDarkPreference);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    try {
      window.localStorage.setItem("todos:theme", isDark ? "dark" : "light");
    } catch {
      // Theme still applies for this session when storage is unavailable.
    }
  }, [isDark]);

  const storeGuestRows = (nextTodos: Todo[]) => {
    try {
      writeGuestTodos(
        nextTodos
          .filter((todo) => todo.source === "guest")
          .map(({ id, title, description, completed, priority, startDate, dueDate, categoryId }) => ({
            id, title, description, completed, priority, startDate, dueDate, categoryId,
          }))
      );
    } catch {
      toast.error("Không thể lưu todo trên thiết bị này. Hãy kiểm tra dung lượng trình duyệt.");
    }
  };

  const updateTodos = (nextTodos: Todo[]) => {
    setTodos(nextTodos);
    storeGuestRows(nextTodos);
  };

  const loadAccountTodos = async (): Promise<Todo[]> => {
    const response = await axiosClient.get<ApiTodo[]>("/todos");
    return response.data.map(mapApiTodo);
  };

  const loadCategories = async (): Promise<Category[]> => {
    const response = await axiosClient.get<ApiCategory[]>("/categories");
    return response.data.map(mapApiCategory);
  };

  const synchronizeGuestCategories = async (
    localCategories: Category[],
    initialAccountCategories: Category[]
  ): Promise<{ categories: Category[]; idMap: Map<string, string> }> => {
    let accountCategories = [...initialAccountCategories];
    const idMap = new Map<string, string>();
    const normalize = (name: string) => name.trim().toLocaleLowerCase("vi");

    for (const localCategory of localCategories) {
      let matching = accountCategories.find((category) => normalize(category.name) === normalize(localCategory.name));
      if (!matching) {
        try {
          const response = await axiosClient.post<ApiCategory>("/categories", {
            name: localCategory.name,
            color: localCategory.color,
          });
          matching = mapApiCategory(response.data);
        } catch (error) {
          if (!axios.isAxiosError(error) || error.response?.status !== 409) throw error;
          accountCategories = await loadCategories();
          matching = accountCategories.find((category) => normalize(category.name) === normalize(localCategory.name));
          if (!matching) throw error;
        }
        if (!accountCategories.some((category) => category.id === matching?.id)) {
          accountCategories.push(matching);
        }
      }
      idMap.set(localCategory.id, matching.id);
    }

    accountCategories.sort((a, b) => a.name.localeCompare(b.name, "vi"));
    return { categories: accountCategories, idMap };
  };

  const importGuestTodos = async (
    guestTodos: GuestTodo[],
    categoryIdMap: Map<string, string>
  ): Promise<Todo[]> => {
    if (guestTodos.length === 0) return [];

    const imported: Todo[] = [];
    for (let index = 0; index < guestTodos.length; index += 500) {
      const batch = guestTodos.slice(index, index + 500);
      const response = await axiosClient.post<{ todos: ApiTodo[] }>("/todos/import", {
        todos: batch.map((todo) => {
          const mappedCategoryId = todo.categoryId ? categoryIdMap.get(todo.categoryId) : null;
          if (todo.categoryId && !mappedCategoryId) {
            throw new Error("A local todo refers to a missing category");
          }
          return {
            clientId: todo.id,
            title: todo.title,
            description: todo.description ?? "",
            completed: todo.completed,
            priority: todo.priority,
            startDate: todo.startDate ?? null,
            dueDate: todo.dueDate ?? null,
            categoryId: mappedCategoryId ?? null,
          };
        }),
      });
      imported.push(...response.data.todos.map(mapApiTodo));
    }
    return imported;
  };

  const remapGuestCategoryFilter = (categoryIdMap: Map<string, string>) => {
    const selectedId = searchParams.get("category");
    const accountCategoryId = selectedId ? categoryIdMap.get(selectedId) : undefined;
    if (!accountCategoryId) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("category", accountCategoryId);
    setSearchParams(nextParams, { replace: true });
  };

  const initialize = async () => {
    setConnectionMessage(null);

    let currentUser: User;
    if (user) {
      currentUser = user;
    } else {
      try {
        const response = await axiosClient.get<User>("/auth/me");
        currentUser = response.data;
      } catch (error) {
        dispatch(logout());
        setMode("guest");
        setTodos(readGuestTodos().map(toGuestView));
        if (!isUnauthorized(error)) {
          setConnectionMessage(
            "Không kết nối được tài khoản lúc này. Todo khách vẫn được lưu trên thiết bị."
          );
        }
        return;
      }
    }

    dispatch(setUser(currentUser));
    setMode("checking");
    setLoading(true);
    const guestTodos = readGuestTodos();
    const localCategories = readGuestCategories();
    setGuestCategories(localCategories);

    try {
      const accountTodos = await loadAccountTodos();
      let categoryIdMap = new Map<string, string>();
      try {
        const synced = await synchronizeGuestCategories(localCategories, await loadCategories());
        categoryIdMap = synced.idMap;
        setCategories(synced.categories);
        setCategoriesLoaded(true);
      } catch (error) {
        console.error("Không thể tải danh mục:", error);
        setCategoriesLoaded(false);
        setConnectionMessage("Chưa đồng bộ được danh mục. Dữ liệu khách vẫn được giữ trên thiết bị; vui lòng thử lại.");
        setTodos(mergeAccountTodos(accountTodos, guestTodos.map(toGuestView)));
        setSyncError(guestTodos.length > 0 || localCategories.length > 0);
        setMode("account");
        return;
      }
      if (guestTodos.length === 0) {
        setTodos(accountTodos);
        setMode("account");
        setSyncError(false);
        return;
      }

      try {
        const importedTodos = await importGuestTodos(guestTodos, categoryIdMap);
        remapGuestCategoryFilter(categoryIdMap);
        clearGuestTodos();
        setTodos(mergeAccountTodos(accountTodos, importedTodos));
        setSyncError(false);
      } catch (error) {
        console.error("Không thể đồng bộ todo khách:", error);
        setTodos(mergeAccountTodos(accountTodos, guestTodos.map(toGuestView)));
        setSyncError(true);
      }
      setMode("account");
    } catch (error) {
      setCategories([]);
      setCategoriesLoaded(false);
      console.error("Không thể tải todo tài khoản:", error);
      if (isUnauthorized(error)) {
        dispatch(logout());
        setTodos(readGuestTodos().map(toGuestView));
        setMode("guest");
        setConnectionMessage("Phiên đăng nhập đã hết hạn. Bạn có thể tiếp tục với todo trên thiết bị.");
      } else {
        setTodos(guestTodos.map(toGuestView));
        setMode("account");
        setConnectionMessage(
          "Không tải được todo từ tài khoản. Todo khách vẫn có thể sử dụng trên thiết bị này."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void initialize();
    // initialize is intentionally run once on page entry to restore the session and data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const handleAddTodo = async (
    title: string,
    description: string,
    priority: TodoPriority,
    startDate: string | null,
    dueDate: string | null,
    categoryId: string | null
  ) => {
    try {
      if (mode === "account") {
        const response = await axiosClient.post<ApiTodo>("/todos", { title, description, priority, startDate, dueDate, categoryId });
        updateTodos([mapApiTodo(response.data), ...todos]);
      } else {
        const todo: Todo = {
          id: crypto.randomUUID(),
          title,
          description,
          completed: false,
          priority,
          startDate,
          dueDate,
          categoryId,
          source: "guest",
        };
        updateTodos([todo, ...todos]);
      }
      toast.success(mode === "account" ? "Đã lưu todo vào tài khoản." : "Đã lưu trên thiết bị này.");
    } catch (error) {
      console.error("Không thể thêm todo:", error);
      throw error;
    }
  };

  const handleEditTodo = async (
    id: string,
    newTitle: string,
    description: string,
    priority: TodoPriority,
    startDate: string | null,
    dueDate: string | null,
    categoryId: string | null
  ) => {
    const todo = todos.find((item) => item.id === id);
    if (!todo) return;
    const title = newTitle.trim();
    if (!title) return;

    if (todo.source === "account") {
      await axiosClient.put(`/todos/${id}`, { title, description, priority, startDate, dueDate, categoryId });
    }
    updateTodos(todos.map((item) => (item.id === id ? { ...item, title, description, priority, startDate, dueDate, categoryId } : item)));
  };

  const handleCreateGuestCategory = async (name: string, color: CategoryColor) => {
    const nextCategories = [...guestCategories, { id: crypto.randomUUID(), name: name.trim(), color }]
      .sort((a, b) => a.name.localeCompare(b.name, "vi"));
    writeGuestCategories(nextCategories);
    setGuestCategories(nextCategories);
    toast.success("Đã lưu danh mục trên thiết bị.");
  };

  const handleUpdateGuestCategory = async (id: string, name: string, color: CategoryColor) => {
    const nextCategories = guestCategories
      .map((category) => category.id === id ? { ...category, name: name.trim(), color } : category)
      .sort((a, b) => a.name.localeCompare(b.name, "vi"));
    writeGuestCategories(nextCategories);
    setGuestCategories(nextCategories);
    toast.success("Đã cập nhật danh mục trên thiết bị.");
  };

  const handleDeleteGuestCategory = async (category: Category) => {
    const nextCategories = guestCategories.filter((item) => item.id !== category.id);
    writeGuestCategories(nextCategories);
    setGuestCategories(nextCategories);
    updateTodos(todos.map((todo) => todo.categoryId === category.id ? { ...todo, categoryId: null } : todo));
    toast.success("Đã xóa danh mục. Các todo vẫn được giữ lại.");
  };

  const handleCreateCategory = async (name: string, color: CategoryColor) => {
    const response = await axiosClient.post<ApiCategory>("/categories", { name, color });
    setCategories((items) => [...items, mapApiCategory(response.data)].sort((a, b) => a.name.localeCompare(b.name, "vi")));
    toast.success("Đã tạo danh mục.");
  };

  const handleUpdateCategory = async (id: string, name: string, color: CategoryColor) => {
    const response = await axiosClient.put<ApiCategory>(`/categories/${id}`, { name, color });
    setCategories((items) => items.map((item) => item.id === id ? mapApiCategory(response.data) : item).sort((a, b) => a.name.localeCompare(b.name, "vi")));
    toast.success("Đã cập nhật danh mục.");
  };

  const handleDeleteCategory = async (category: Category) => {
    await axiosClient.delete(`/categories/${category.id}`);
    setCategories((items) => items.filter((item) => item.id !== category.id));
    setTodos((items) => items.map((todo) => todo.categoryId === category.id ? { ...todo, categoryId: null } : todo));
    if (searchParams.get("category") === category.id) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("category");
      setSearchParams(nextParams);
    }
    toast.success("Đã xóa danh mục. Các công việc vẫn được giữ lại.");
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    const todo = todos.find((item) => item.id === id);
    if (!todo) return;

    if (todo.source === "account") {
      await axiosClient.put(`/todos/${id}`, { completed });
    }
    updateTodos(todos.map((item) => (item.id === id ? { ...item, completed } : item)));
  };

  const handleDeleteTodo = async (id: string) => {
    const todo = todos.find((item) => item.id === id);
    if (!todo) return;

    if (todo.source === "account") {
      await axiosClient.delete(`/todos/${id}`);
    }
    updateTodos(todos.filter((item) => item.id !== id));
  };

  const handleSyncGuestTodos = async () => {
    const guestTodos = readGuestTodos();
    const localCategories = readGuestCategories();
    if (guestTodos.length === 0 && localCategories.length === 0) {
      setSyncError(false);
      return;
    }

    setSyncing(true);
    try {
      const synced = await synchronizeGuestCategories(localCategories, await loadCategories());
      setCategories(synced.categories);
      setCategoriesLoaded(true);
      const importedTodos = await importGuestTodos(guestTodos, synced.idMap);
      if (guestTodos.length > 0) {
        remapGuestCategoryFilter(synced.idMap);
        clearGuestTodos();
        updateTodos(mergeAccountTodos(todos.filter((todo) => todo.source === "account"), importedTodos));
      }
      setSyncError(false);
      toast.success(guestTodos.length > 0
        ? "Todo và danh mục khách đã được đồng bộ vào tài khoản."
        : "Danh mục khách đã được đồng bộ vào tài khoản.");
    } catch (error) {
      console.error("Đồng bộ todo thất bại:", error);
      setSyncError(true);
      toast.error("Đồng bộ chưa thành công. Todo vẫn được giữ trên thiết bị.");
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axiosClient.post("/auth/logout");
      dispatch(logout());
      setMode("guest");
      setCategories([]);
      setCategoriesLoaded(false);
      updateTodos(readGuestTodos().map(toGuestView));
      setConnectionMessage(null);
      toast.success("Đã đăng xuất. Todo trong tài khoản vẫn được lưu trên MongoDB.");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Đăng xuất thất bại:", error);
      toast.error("Đăng xuất chưa thành công. Vui lòng thử lại.");
    }
  };

  const pendingCount = todos.filter((todo) => !todo.completed).length;
  const completedCount = todos.length - pendingCount;
  const requestedStatus = searchParams.get("status");
  const selectedTaskFilter: ViewFilter =
    requestedStatus === "active" || requestedStatus === "completed" ? requestedStatus : "all";
  const requestedDateFilter = searchParams.get("date");
  const selectedDateFilter: DateFilter =
    requestedDateFilter === "today" || requestedDateFilter === "upcoming" || requestedDateFilter === "overdue"
      ? requestedDateFilter
      : "all";
  const isHighPriorityFilter = isDashboard && searchParams.get("priority") === "high";
  const hasUnsyncedGuestTodos = todos.some((todo) => todo.source === "guest");
  const visibleCategories = isDashboard && !hasUnsyncedGuestTodos
    ? categories
    : [...categories, ...guestCategories];
  const requestedCategory = searchParams.get("category");
  const selectedCategoryFilter = requestedCategory === "uncategorized" || visibleCategories.some((category) => category.id === requestedCategory)
    ? requestedCategory!
    : "all";
  const today = getLocalDateOnly();
  const filteredTodos = useMemo(
    () =>
      todos.filter((todo) => {
        const matchesSearch = todo.title
          .toLocaleLowerCase("vi")
          .includes(searchTerm.trim().toLocaleLowerCase("vi"));
        const activeFilter = isDashboard ? selectedTaskFilter : filter;
        const matchesPriority = !isHighPriorityFilter || todo.priority === "high";
        const matchesCategory = selectedCategoryFilter === "all" ||
          (selectedCategoryFilter === "uncategorized" ? !todo.categoryId : todo.categoryId === selectedCategoryFilter);
        const hasDates = Boolean(todo.startDate || todo.dueDate);
        const matchesDate =
          selectedDateFilter === "all" ||
          (selectedDateFilter === "today" && hasDates && (
            todo.startDate === today ||
            todo.dueDate === today ||
            Boolean(todo.startDate && todo.dueDate && todo.startDate < today && todo.dueDate > today)
          )) ||
          (selectedDateFilter === "upcoming" && Boolean(
            (todo.startDate && todo.startDate > today) ||
            (!todo.startDate && todo.dueDate && todo.dueDate > today)
          )) ||
          (selectedDateFilter === "overdue" && Boolean(todo.dueDate && todo.dueDate < today && !todo.completed));
        const matchesFilter =
          activeFilter === "all" ||
          (activeFilter === "active" && !todo.completed) ||
          (activeFilter === "completed" && todo.completed);
        return matchesSearch && matchesFilter && matchesPriority && matchesDate && matchesCategory;
      }),
    [filter, isDashboard, isHighPriorityFilter, searchTerm, selectedCategoryFilter, selectedDateFilter, selectedTaskFilter, today, todos]
  );

  const filterOptions: { id: ViewFilter; label: string; count: number }[] = [
    { id: "all", label: "Tất cả", count: todos.length },
    { id: "active", label: "Chưa hoàn thành", count: pendingCount },
    { id: "completed", label: "Đã hoàn thành", count: completedCount },
  ];
  const priorityOptions: { id: TodoPriority; label: string; color: string; count: number }[] = [
    { id: "high", label: "Cao", color: "bg-red-500", count: todos.filter((todo) => todo.priority === "high").length },
    { id: "medium", label: "Trung bình", color: "bg-amber-500", count: todos.filter((todo) => todo.priority === "medium").length },
    { id: "low", label: "Thấp", color: "bg-slate-400", count: todos.filter((todo) => todo.priority === "low").length },
  ];
  const dateFilterOptions: { id: DateFilter; label: string; count: number }[] = [
    { id: "all", label: "Mọi thời điểm", count: todos.length },
    { id: "today", label: "Hôm nay", count: todos.filter((todo) => {
      const hasDates = Boolean(todo.startDate || todo.dueDate);
      return hasDates && (
        todo.startDate === today || todo.dueDate === today ||
        Boolean(todo.startDate && todo.dueDate && todo.startDate < today && todo.dueDate > today)
      );
    }).length },
    { id: "upcoming", label: "Sắp tới", count: todos.filter((todo) => Boolean(
      (todo.startDate && todo.startDate > today) || (!todo.startDate && todo.dueDate && todo.dueDate > today)
    )).length },
    { id: "overdue", label: "Quá hạn", count: todos.filter((todo) => Boolean(todo.dueDate && todo.dueDate < today && !todo.completed)).length },
  ];

  const isOverviewPage = location.pathname === "/dashboard" || location.pathname === "/dashboard/";
  const isAccountPage = location.pathname === "/dashboard/account";
  const isCategoriesPage = location.pathname === "/dashboard/categories";
  const categoryFilterOptions = [
    { id: "all", label: "Mọi danh mục", count: todos.length },
    ...visibleCategories.map((category) => ({
      id: category.id,
      label: category.name,
      count: todos.filter((todo) => todo.categoryId === category.id).length,
    })),
    { id: "uncategorized", label: "Chưa phân loại", count: todos.filter((todo) => !todo.categoryId).length },
  ];
  const handleSelectTaskFilter = (nextFilter: ViewFilter) => {
    if (!isDashboard) {
      setFilter(nextFilter);
      return;
    }
    const nextParams = new URLSearchParams(searchParams);
    if (nextFilter === "all") nextParams.delete("status");
    else nextParams.set("status", nextFilter);
    setSearchParams(nextParams);
  };
  const toggleHighPriorityFilter = () => {
    const nextParams = new URLSearchParams(searchParams);
    if (isHighPriorityFilter) nextParams.delete("priority");
    else nextParams.set("priority", "high");
    setSearchParams(nextParams);
  };
  const handleSelectDateFilter = (nextFilter: DateFilter) => {
    const nextParams = new URLSearchParams(searchParams);
    if (nextFilter === "all") nextParams.delete("date");
    else nextParams.set("date", nextFilter);
    setSearchParams(nextParams);
  };
  const handleSelectCategoryFilter = (nextFilter: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (nextFilter === "all") nextParams.delete("category");
    else nextParams.set("category", nextFilter);
    setSearchParams(nextParams);
  };

  if (isDashboard) {
    return (
      <>
        <DashboardLayout
          username={user?.username ?? "Tài khoản"}
          searchTerm={searchTerm}
          isDark={isDark}
          onSearch={setSearchTerm}
          onToggleTheme={() => setIsDark((dark) => !dark)}
          onAddTodo={() => setIsAddTodoOpen(true)}
          addTodoDisabled={mode !== "account"}
          onLogout={handleLogout}
        >
          {isOverviewPage ? (
            <>
              {connectionMessage && (
                <p role="status" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                  {connectionMessage}
                </p>
              )}
              <DashboardOverview
                todos={todos}
                loading={loading || mode !== "account"}
                onToggleComplete={handleToggleComplete}
              />
            </>
          ) : isAccountPage ? (
            user ? (
              <AccountPanel username={user.username} email={user.email} onLogout={handleLogout} />
            ) : (
              <p role="status" className="text-sm text-muted-foreground">Đang tải thông tin tài khoản...</p>
            )
          ) : isCategoriesPage ? (
            <CategoryManager
              categories={categories}
              todoCounts={Object.fromEntries(categories.map((category) => [category.id, todos.filter((todo) => todo.categoryId === category.id).length]))}
              onCreate={handleCreateCategory}
              onUpdate={handleUpdateCategory}
              onDelete={handleDeleteCategory}
            />
          ) : (
            <div className="space-y-6">
              <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-foreground">Công việc của tôi</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-muted-foreground">Theo dõi, cập nhật và sắp xếp công việc theo mức độ ưu tiên.</p>
                </div>
              </section>
              {connectionMessage && (
                <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                  {connectionMessage}
                </p>
              )}
              {syncError && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                  <span>Todo trên thiết bị chưa đồng bộ được vào tài khoản.</span>
                  <Button onClick={handleSyncGuestTodos} disabled={syncing} variant="outline" size="sm">
                    <CloudUpload size={16} /> {syncing ? "Đang đồng bộ..." : "Thử đồng bộ lại"}
                  </Button>
                </div>
              )}
              <section aria-label="Danh s?ch todo">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2" aria-label="Thống kê mức độ ưu tiên">
                    {priorityOptions.map((option) => (
                      <span key={option.id} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 dark:border-border dark:bg-card dark:text-card-foreground">
                        <span className={`size-2 rounded-full ${option.color}`} aria-hidden="true" />
                        {option.label}: <strong>{option.count}</strong>
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant={isHighPriorityFilter ? "default" : "outline"}
                      aria-pressed={isHighPriorityFilter}
                      onClick={toggleHighPriorityFilter}
                      className={isHighPriorityFilter ? "bg-red-600 text-white hover:bg-red-700" : ""}
                    >
                      Ưu tiên cao
                    </Button>
                    <TodoFilterMenu
                      options={filterOptions}
                      selectedId={selectedTaskFilter}
                      onSelect={handleSelectTaskFilter}
                    />
                    <TodoFilterMenu
                      options={dateFilterOptions}
                      selectedId={selectedDateFilter}
                      onSelect={handleSelectDateFilter}
                    />
                    <TodoFilterMenu
                      options={categoryFilterOptions}
                      selectedId={selectedCategoryFilter === "all" ? "all" : selectedCategoryFilter}
                      onSelect={handleSelectCategoryFilter}
                    />
                  </div>
                </div>
                <TodoList
                  todos={filteredTodos}
                  loading={loading}
                  hasTodos={todos.length > 0}
                  searchTerm={searchTerm}
                  resetKey={`${selectedTaskFilter}:${selectedDateFilter}:${selectedCategoryFilter}:${isHighPriorityFilter}:${searchTerm}`}
                  categories={categories}
                  guestCategories={guestCategories}
                  canAssignCategory={mode === "account" && categoriesLoaded}
                  canAssignGuestCategory={mode === "account" || mode === "guest"}
                  onEdit={handleEditTodo}
                  onDelete={handleDeleteTodo}
                  onToggleComplete={handleToggleComplete}
                />
              </section>
            </div>
          )}
        </DashboardLayout>
        <AddTodoModal isOpen={isAddTodoOpen} setIsOpen={setIsAddTodoOpen} onAdd={handleAddTodo} categories={categories} canAssignCategory={mode === "account" && categoriesLoaded} />
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f6faf7] text-slate-800 dark:bg-background dark:text-foreground">
      <NavBar
        user={mode === "account" ? user : null}
        onLogout={handleLogout}
        onSearch={setSearchTerm}
        isDark={isDark}
        onToggleTheme={() => setIsDark((dark) => !dark)}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-12 pt-8 text-foreground sm:px-6 sm:pt-12">
        <section className="mb-8 flex flex-col-reverse items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-foreground sm:text-3xl">
            Việc cần làm hôm nay
          </h1>
          <Button
            onClick={() => setIsAddTodoOpen(true)}
            disabled={mode === "checking"}
            size="lg"
            className="shrink-0 bg-emerald-500 text-white hover:bg-emerald-600"
          >
            <Plus size={19} /> Thêm công việc
          </Button>
        </section>

        {connectionMessage && (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {connectionMessage}
          </div>
        )}

        <section aria-label="Danh sách todo">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2" aria-label="Thống kê mức độ ưu tiên">
              {priorityOptions.map((option) => (
                <span
                  key={option.id}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 dark:border-border dark:bg-card dark:text-card-foreground"
                >
                  <span className={`size-2 rounded-full ${option.color}`} aria-hidden="true" />
                  {option.label}: <strong>{option.count}</strong>
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <TodoFilterMenu options={filterOptions} selectedId={filter} onSelect={setFilter} />
              <TodoFilterMenu
                options={dateFilterOptions}
                selectedId={selectedDateFilter}
                onSelect={handleSelectDateFilter}
              />
              <TodoFilterMenu
                options={categoryFilterOptions}
                selectedId={selectedCategoryFilter}
                onSelect={handleSelectCategoryFilter}
              />
            </div>
          </div>

          <TodoList
            todos={filteredTodos}
            loading={loading}
            hasTodos={todos.length > 0}
            searchTerm={searchTerm}
            resetKey={`${filter}:${selectedDateFilter}:${searchTerm}`}
            categories={categories}
            guestCategories={guestCategories}
            canAssignCategory={mode === "account" && categoriesLoaded}
            canAssignGuestCategory={mode === "guest" || mode === "account"}
            onEdit={handleEditTodo}
            onDelete={handleDeleteTodo}
            onToggleComplete={handleToggleComplete}
          />
        </section>
        {mode === "guest" && (
          <section className="mt-8">
            <CategoryManager
              categories={guestCategories}
              todoCounts={Object.fromEntries(guestCategories.map((category) => [category.id, todos.filter((todo) => todo.categoryId === category.id).length]))}
              onCreate={handleCreateGuestCategory}
              onUpdate={handleUpdateGuestCategory}
              onDelete={handleDeleteGuestCategory}
            />
          </section>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white dark:border-border dark:bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-sm text-slate-500 dark:text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            {mode === "account"
              ? "Todo tài khoản được lưu và đồng bộ với MongoDB."
              : "Todo khách được lưu trên trình duyệt này; đăng nhập để đồng bộ trên thiết bị khác."}
            {syncError && " Việc đồng bộ trước đó chưa hoàn tất."}
          </p>
          {mode === "account" && (todos.some((todo) => todo.source === "guest") || (syncError && guestCategories.length > 0)) && (
            <Button
              onClick={handleSyncGuestTodos}
              disabled={syncing}
              variant="outline"
              size="sm"
              className="shrink-0 self-start border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-300 dark:hover:bg-blue-950 sm:self-auto"
            >
              <CloudUpload size={16} /> {syncing ? "Đang đồng bộ..." : "Thử đồng bộ lại"}
            </Button>
          )}
        </div>
      </footer>

      <AddTodoModal
        isOpen={isAddTodoOpen}
        setIsOpen={setIsAddTodoOpen}
        onAdd={handleAddTodo}
        categories={mode === "account" ? categories : guestCategories}
        canAssignCategory={mode === "guest" || (mode === "account" && categoriesLoaded)}
      />
    </div>
  );
};

export default Home;
