import {
  LayoutDashboard,
  ListTodo,
  LogOut,
  Moon,
  Plus,
  Search,
  Sun,
  UserRound,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

interface DashboardLayoutProps {
  username: string;
  searchTerm: string;
  isDark: boolean;
  onSearch: (term: string) => void;
  onToggleTheme: () => void;
  onAddTodo: () => void;
  addTodoDisabled: boolean;
  onLogout: () => void;
  children: ReactNode;
}

const navItems = [
  { to: "/dashboard", label: "Tổng quan", icon: LayoutDashboard, end: true },
  { to: "/dashboard/tasks", label: "Công việc", icon: ListTodo, end: false },
  { to: "/dashboard/account", label: "Tài khoản", icon: UserRound, end: false },
];

const DashboardLayout = ({
  username,
  searchTerm,
  isDark,
  onSearch,
  onToggleTheme,
  onAddTodo,
  addTodoDisabled,
  onLogout,
  children,
}: DashboardLayoutProps) => {
  const location = useLocation();
  const pageTitle = navItems.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  )?.label ?? "Tổng quan";

  const navigation = (mobile = false) => (
    <nav
      aria-label="Điều hướng dashboard"
      className={mobile ? "flex gap-2 overflow-x-auto" : "space-y-1"}
    >
      {navItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            [
              "flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-muted-foreground dark:hover:bg-accent dark:hover:text-foreground",
              mobile ? "whitespace-nowrap" : "w-full",
            ].join(" ")
          }
        >
          <Icon size={18} aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#f6faf7] text-slate-800 dark:bg-background dark:text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-emerald-100 bg-white dark:border-border dark:bg-card lg:flex">
        <NavLink to="/dashboard" className="flex h-20 items-center gap-3 border-b border-slate-100 px-6 dark:border-border">
          <img src="/todos-logo.png" alt="" className="size-10 rounded-full object-contain" />
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground">Todos</span>
        </NavLink>
        <div className="px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Không gian làm việc</p>
          {navigation()}
        </div>
        <div className="mt-auto border-t border-slate-100 p-4 dark:border-border">
          <div className="mb-3 flex items-center gap-3 px-2">
            <span className="flex size-9 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {username.slice(0, 1).toLocaleUpperCase("vi")}
            </span>
            <span className="min-w-0 truncate text-sm font-medium">{username}</span>
          </div>
          <Button variant="ghost" className="w-full justify-start text-slate-600 dark:text-muted-foreground" onClick={onLogout}>
            <LogOut size={17} /> Đăng xuất
          </Button>
        </div>
      </aside>

      <div className="flex min-h-screen w-full flex-col lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-emerald-100 bg-white/90 backdrop-blur dark:border-border dark:bg-background/90">
          <div className="mx-auto flex min-h-16 max-w-[1600px] items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-500 dark:text-muted-foreground lg:hidden">Todos</p>
              <h1 className="truncate text-lg font-semibold text-slate-900 dark:text-foreground">{pageTitle}</h1>
            </div>
            <label className="relative hidden w-full max-w-sm items-center md:flex">
              <Search size={17} className="pointer-events-none absolute left-3 text-muted-foreground" />
              <span className="sr-only">Tìm kiếm công việc</span>
              <Input
                type="search"
                value={searchTerm}
                onChange={(event) => onSearch(event.target.value)}
                placeholder="Tìm kiếm công việc..."
                className="h-10 pl-9"
              />
            </label>
            <Button onClick={onAddTodo} disabled={addTodoDisabled} className="h-10 shrink-0 bg-emerald-500 text-white hover:bg-emerald-600">
              <Plus size={17} /> <span className="hidden sm:inline">Thêm việc</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onToggleTheme}
              aria-label={isDark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
              title={isDark ? "Giao diện sáng" : "Giao diện tối"}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
            <Button variant="ghost" className="shrink-0 px-2 lg:hidden" onClick={onLogout} aria-label="Đăng xuất">
              <LogOut size={18} />
            </Button>
          </div>
          <div className="border-t border-slate-100 px-4 py-2 dark:border-border lg:hidden">
            {navigation(true)}
          </div>
          <div className="px-4 pb-3 md:hidden">
            <label className="relative flex items-center">
              <Search size={17} className="pointer-events-none absolute left-3 text-muted-foreground" />
              <span className="sr-only">Tìm kiếm công việc</span>
              <Input
                type="search"
                value={searchTerm}
                onChange={(event) => onSearch(event.target.value)}
                placeholder="Tìm kiếm công việc..."
                className="h-10 pl-9"
              />
            </label>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </main>
        <footer className="mt-auto border-t border-slate-200 bg-white px-4 py-4 text-center text-xs text-slate-500 dark:border-border dark:bg-card dark:text-muted-foreground sm:px-6 lg:px-8">
          Todo tài khoản được lưu và đồng bộ với MongoDB.
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
