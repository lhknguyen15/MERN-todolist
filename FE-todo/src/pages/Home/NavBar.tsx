import { LayoutDashboard, LogOut, Moon, Search, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

interface NavBarProps {
  user: { id: string; username: string; email: string } | null;
  onLogout: () => void;
  onSearch: (term: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ user, onLogout, onSearch, isDark, onToggleTheme }) => (
  <header className="sticky top-0 z-20 border-b border-emerald-100 bg-white/90 backdrop-blur dark:border-border dark:bg-background/90">
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:gap-8 sm:px-6">
      <Link to="/" className="flex shrink-0 items-center gap-2.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground" aria-label="Todos, trang chủ">
        <img src="/todos-logo.png" alt="" className="size-9 rounded-full object-contain" />
        Todos
      </Link>

      <label className="relative mx-auto flex min-w-0 max-w-xl flex-1 items-center">
        <Search size={19} className="pointer-events-none absolute left-3 text-muted-foreground" />
        <span className="sr-only">Tìm kiếm công việc</span>
        <Input
          type="search"
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Tìm kiếm công việc..."
          className="h-11 pl-10 pr-3 text-base"
        />
      </label>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
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
        {user ? (
          <>
            <Button asChild variant="outline" size="icon" className="sm:hidden">
              <Link to="/dashboard" aria-label="Mở dashboard"><LayoutDashboard size={17} /></Link>
            </Button>
            <Button asChild variant="outline" className="hidden sm:inline-flex">
              <Link to="/dashboard"><LayoutDashboard size={16} /> Dashboard</Link>
            </Button>
            <span className="hidden max-w-40 truncate text-base font-medium text-slate-700 dark:text-muted-foreground md:inline">
              {user.username}
            </span>
            <Button
              onClick={onLogout}
              variant="outline"
              size="default"
              className="text-base"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Đăng xuất</span>
            </Button>
          </>
        ) : (
          <Button asChild className="bg-emerald-500 text-base text-white hover:bg-emerald-600">
            <Link to="/sign-in">Đăng nhập</Link>
          </Button>
        )}
      </div>
    </div>
  </header>
);

export default NavBar;
