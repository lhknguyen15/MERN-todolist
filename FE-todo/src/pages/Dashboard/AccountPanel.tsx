import { LogOut, Mail, UserRound } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

interface AccountPanelProps {
  username: string;
  email: string;
  onLogout: () => void;
}

const AccountPanel = ({ username, email, onLogout }: AccountPanelProps) => (
  <div className="mx-auto max-w-3xl space-y-6">
    <section>
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-foreground">Tài khoản của bạn</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-muted-foreground">Thông tin hồ sơ và phiên đăng nhập.</p>
    </section>

    <Card className="gap-0 border-emerald-100 bg-white py-0 shadow-sm dark:border-border dark:bg-card">
      <CardHeader className="flex flex-row items-center gap-4 border-b border-slate-100 px-5 py-5 dark:border-border sm:px-6">
        <span className="flex size-14 items-center justify-center rounded-full bg-emerald-100 text-xl font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          {username.slice(0, 1).toLocaleUpperCase("vi")}
        </span>
        <div className="min-w-0">
          <CardTitle className="truncate text-lg text-slate-900 dark:text-foreground">{username}</CardTitle>
          <p className="mt-1 text-sm text-slate-500 dark:text-muted-foreground">Tài khoản Todo</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3">
          <UserRound size={18} className="mt-0.5 text-emerald-600" aria-hidden="true" />
          <div>
            <p className="text-xs text-slate-500 dark:text-muted-foreground">Họ và tên</p>
            <p className="mt-1 text-sm font-medium">{username}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Mail size={18} className="mt-0.5 text-emerald-600" aria-hidden="true" />
          <div>
            <p className="text-xs text-slate-500 dark:text-muted-foreground">Email</p>
            <p className="mt-1 break-all text-sm font-medium">{email}</p>
          </div>
        </div>
        <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
          Công việc trong tài khoản được lưu trên MongoDB và có thể đồng bộ trên thiết bị khác.
        </div>
        <Button variant="outline" onClick={onLogout} className="text-slate-700 dark:text-foreground">
          <LogOut size={17} /> Đăng xuất
        </Button>
      </CardContent>
    </Card>
  </div>
);

export default AccountPanel;
