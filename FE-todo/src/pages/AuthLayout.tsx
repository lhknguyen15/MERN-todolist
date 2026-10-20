import { Link, Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="grid min-h-screen bg-[#f6faf7] dark:bg-background lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-emerald-500 px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
        <Link to="/" className="flex w-fit items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
          <span className="flex size-12 items-center justify-center rounded-full bg-white p-1.5">
            <img src="/todos-logo.png" alt="" className="size-full object-contain" />
          </span>
          <span className="text-2xl font-bold tracking-tight">Todos</span>
        </Link>
        <div className="relative z-10 max-w-lg pb-16">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-50">Không gian của bạn</p>
          <h1 className="text-4xl font-semibold leading-tight xl:text-5xl">Tập trung vào điều quan trọng.</h1>
          <p className="mt-5 max-w-md text-base leading-7 text-emerald-50">
            Ghi lại công việc, sắp xếp mức độ ưu tiên và theo dõi tiến độ mỗi ngày.
          </p>
        </div>
        <p className="text-sm text-emerald-50">Bắt đầu từ một việc nhỏ hôm nay.</p>
        <div className="pointer-events-none absolute -bottom-28 -right-24 size-96 rounded-full border-[36px] border-white/10" />
        <div className="pointer-events-none absolute right-20 top-28 size-28 rounded-full bg-emerald-400/50" />
      </aside>

      <main className="flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:px-8">
        <Link to="/" className="mb-6 flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 dark:text-foreground lg:hidden">
          <img src="/todos-logo.png" alt="" className="size-9 rounded-full object-contain" />
          Todos
        </Link>
        <div className="w-full max-w-md rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm dark:border-border dark:bg-card sm:p-9">
          <Outlet />
        </div>
        <Link to="/" className="mt-5 text-sm text-slate-500 transition-colors hover:text-emerald-700 dark:text-muted-foreground dark:hover:text-emerald-300">
          ← Quay về trang chủ
        </Link>
      </main>
    </div>
  );
};

export default AuthLayout;
