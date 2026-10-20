import { Check, CircleCheck, ListTodo, ListChecks, TriangleAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Todo, TodoPriority } from "../../types/todo";

interface DashboardOverviewProps {
  todos: Todo[];
  loading: boolean;
  onToggleComplete: (id: string, completed: boolean) => Promise<void>;
}

const priorityStyles: Record<TodoPriority, string> = {
  high: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900",
  medium: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900",
  low: "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700",
};

const priorityLabels: Record<TodoPriority, string> = {
  high: "Cao",
  medium: "Trung bình",
  low: "Thấp",
};

const DashboardOverview = ({ todos, loading, onToggleComplete }: DashboardOverviewProps) => {
  const incomplete = todos.filter((todo) => !todo.completed);
  const completed = todos.length - incomplete.length;
  const highPriority = todos.filter((todo) => todo.priority === "high" && !todo.completed).length;
  const stats = [
    { label: "Tổng công việc", value: todos.length, icon: ListTodo, href: "/dashboard/tasks", tone: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300" },
    { label: "Cần hoàn thành", value: incomplete.length, icon: TriangleAlert, href: "/dashboard/tasks?status=active", tone: "text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-300" },
    { label: "Đã hoàn thành", value: completed, icon: CircleCheck, href: "/dashboard/tasks?status=completed", tone: "text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-300" },
    { label: "Ưu tiên cao", value: highPriority, icon: ListChecks, href: "/dashboard/tasks?status=active&priority=high", tone: "text-red-600 bg-red-50 dark:bg-red-950/50 dark:text-red-300" },
  ];

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-foreground">Chào mừng trở lại</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-muted-foreground">Đây là tình hình công việc của bạn.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Thống kê công việc">
        {stats.map(({ label, value, icon: Icon, href, tone }) => (
          <Link key={label} to={href} className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2">
            <Card className="h-full gap-4 border-emerald-100 bg-white py-5 shadow-sm transition group-hover:-translate-y-0.5 group-hover:border-emerald-300 group-hover:shadow-md dark:border-border dark:bg-card dark:group-hover:border-emerald-800">
              <CardContent className="flex items-center justify-between px-5">
                <div>
                  <p className="text-sm text-slate-500 dark:text-muted-foreground">{label}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-foreground">{loading ? "—" : value}</p>
                </div>
                <span className={`flex size-11 items-center justify-center rounded-xl ${tone}`}>
                  <Icon size={21} aria-hidden="true" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      <Card className="gap-0 overflow-hidden border-emerald-100 bg-white py-0 shadow-sm dark:border-border dark:bg-card">
        <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-border sm:px-6">
          <div>
            <CardTitle className="text-base text-slate-900 dark:text-foreground">Việc cần làm tiếp theo</CardTitle>
            <p className="mt-1 text-sm text-slate-500 dark:text-muted-foreground">Các công việc chưa hoàn thành của bạn.</p>
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-950">
            <Link to="/dashboard/tasks">Xem tất cả</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">Đang tải công việc...</p>
          ) : incomplete.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <CircleCheck className="mx-auto size-9 text-emerald-500" aria-hidden="true" />
              <p className="mt-3 font-medium text-slate-800 dark:text-foreground">Bạn đã hoàn thành mọi việc</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-muted-foreground">Thêm công việc mới khi bạn sẵn sàng.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-border">
              {incomplete.slice(0, 5).map((todo) => (
                <li key={todo.id} className="flex items-center gap-3 px-5 py-4 sm:px-6">
                  <button
                    type="button"
                    onClick={() => void onToggleComplete(todo.id, true)}
                    aria-label={`Hoàn thành: ${todo.title}`}
                    className="flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-slate-300 text-transparent transition-colors hover:border-emerald-500 hover:bg-emerald-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                  >
                    <Check size={12} strokeWidth={3} />
                  </button>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800 dark:text-foreground">{todo.title}</span>
                  <span className={`hidden rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset sm:inline-flex ${priorityStyles[todo.priority]}`}>
                    {priorityLabels[todo.priority]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
