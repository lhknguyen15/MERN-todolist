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
  writeGuestTodos,
} from "../../apis/guestTodoStorage";
import TodoList from "../../components/Todo/Todolist";
import AddTodoModal from "../../components/Todo/AddTodoModal";
import { Button } from "../../components/ui/button";
import TodoFilterMenu from "../../components/Todo/TodoFilterMenu";
import { logout, setUser } from "../../redux/slices/authSlice";
import { RootState } from "../../redux/store";
import { ApiTodo, GuestTodo, mapApiTodo, Todo, TodoPriority } from "../../types/todo";
import NavBar from "./NavBar";
import DashboardLayout from "../Dashboard/DashboardLayout";
import DashboardOverview from "../Dashboard/DashboardOverview";
import AccountPanel from "../Dashboard/AccountPanel";

interface User {
  id: string;
  username: string;
  email: string;
}

type ViewFilter = "all" | "active" | "completed";
type DataMode = "checking" | "guest" | "account";

const readDarkPreference = () => {
  try {
    return window.localStorage.getItem("todos:theme") === "dark";
  } catch {
    return false;
  }
};

const toGuestView = (todo: GuestTodo): Todo => ({ ...todo, source: "guest" });

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
          .map(({ id, title, completed, priority }) => ({ id, title, completed, priority }))
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

  const importGuestTodos = async (guestTodos: GuestTodo[]): Promise<Todo[]> => {
    if (guestTodos.length === 0) return [];

    const imported: Todo[] = [];
    for (let index = 0; index < guestTodos.length; index += 500) {
      const batch = guestTodos.slice(index, index + 500);
      const response = await axiosClient.post<{ todos: ApiTodo[] }>("/todos/import", {
        todos: batch.map(({ id, title, completed, priority }) => ({
          clientId: id,
          title,
          completed,
          priority,
        })),
      });
      imported.push(...response.data.todos.map(mapApiTodo));
    }
    return imported;
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

    try {
      const accountTodos = await loadAccountTodos();
      if (guestTodos.length === 0) {
        setTodos(accountTodos);
        setMode("account");
        setSyncError(false);
        return;
      }

      try {
        const importedTodos = await importGuestTodos(guestTodos);
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

  const handleAddTodo = async (title: string, priority: TodoPriority) => {
    try {
      if (mode === "account") {
        const response = await axiosClient.post<ApiTodo>("/todos", { title, priority });
        updateTodos([mapApiTodo(response.data), ...todos]);
      } else {
        const todo: Todo = {
          id: crypto.randomUUID(),
          title,
          completed: false,
          priority,
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

  const handleEditTodo = async (id: string, newTitle: string, priority: TodoPriority) => {
    const todo = todos.find((item) => item.id === id);
    if (!todo) return;
    const title = newTitle.trim();
    if (!title) return;

    if (todo.source === "account") {
      await axiosClient.put(`/todos/${id}`, { title, priority });
    }
    updateTodos(todos.map((item) => (item.id === id ? { ...item, title, priority } : item)));
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
    if (guestTodos.length === 0) {
      setSyncError(false);
      return;
    }

    setSyncing(true);
    try {
      const importedTodos = await importGuestTodos(guestTodos);
      clearGuestTodos();
      updateTodos(
        mergeAccountTodos(
          todos.filter((todo) => todo.source === "account"),
          importedTodos
        )
      );
      setSyncError(false);
      toast.success("Todo khách đã được đồng bộ vào tài khoản.");
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
  const isHighPriorityFilter = isDashboard && searchParams.get("priority") === "high";
  const filteredTodos = useMemo(
    () =>
      todos.filter((todo) => {
        const matchesSearch = todo.title
          .toLocaleLowerCase("vi")
          .includes(searchTerm.trim().toLocaleLowerCase("vi"));
        const activeFilter = isDashboard ? selectedTaskFilter : filter;
        const matchesPriority = !isHighPriorityFilter || todo.priority === "high";
        const matchesFilter =
          activeFilter === "all" ||
          (activeFilter === "active" && !todo.completed) ||
          (activeFilter === "completed" && todo.completed);
        return matchesSearch && matchesFilter && matchesPriority;
      }),
    [filter, isDashboard, isHighPriorityFilter, searchTerm, selectedTaskFilter, todos]
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

  const isOverviewPage = location.pathname === "/dashboard" || location.pathname === "/dashboard/";
  const isAccountPage = location.pathname === "/dashboard/account";
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
              <section aria-label="Danh sách todo">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2" aria-label="Thống kê mức độ ưu tiên">
                    {priorityOptions.map((option) => (
                      <span key={option.id} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 dark:border-border dark:bg-card dark:text-card-foreground">
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
                  </div>
                </div>
                <TodoList
                  todos={filteredTodos}
                  loading={loading}
                  hasTodos={todos.length > 0}
                  searchTerm={searchTerm}
                  resetKey={`${selectedTaskFilter}:${isHighPriorityFilter}:${searchTerm}`}
                  onEdit={handleEditTodo}
                  onDelete={handleDeleteTodo}
                  onToggleComplete={handleToggleComplete}
                />
              </section>
            </div>
          )}
        </DashboardLayout>
        <AddTodoModal isOpen={isAddTodoOpen} setIsOpen={setIsAddTodoOpen} onAdd={handleAddTodo} />
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
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 dark:border-border dark:bg-card dark:text-card-foreground"
                >
                  <span className={`size-2 rounded-full ${option.color}`} aria-hidden="true" />
                  {option.label}: <strong>{option.count}</strong>
                </span>
              ))}
            </div>
            <TodoFilterMenu options={filterOptions} selectedId={filter} onSelect={setFilter} />
          </div>

          <TodoList
            todos={filteredTodos}
            loading={loading}
            hasTodos={todos.length > 0}
            searchTerm={searchTerm}
            resetKey={`${filter}:${searchTerm}`}
            onEdit={handleEditTodo}
            onDelete={handleDeleteTodo}
            onToggleComplete={handleToggleComplete}
          />
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white dark:border-border dark:bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-sm text-slate-500 dark:text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            {mode === "account"
              ? "Todo tài khoản được lưu và đồng bộ với MongoDB."
              : "Todo khách được lưu trên trình duyệt này; đăng nhập để đồng bộ trên thiết bị khác."}
            {syncError && " Việc đồng bộ trước đó chưa hoàn tất."}
          </p>
          {mode === "account" && todos.some((todo) => todo.source === "guest") && (
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

      <AddTodoModal isOpen={isAddTodoOpen} setIsOpen={setIsAddTodoOpen} onAdd={handleAddTodo} />
    </div>
  );
};

export default Home;
