import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { loginUser } from "../redux/slices/authSlice";
import { AppDispatch, RootState } from "../redux/store";
const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }))
      .unwrap()
      .then(() => {
        navigate("/dashboard", { replace: true });
        toast.success("Đăng nhập thành công!");
      })
      .catch((error) => {
        toast.error(error);
      });
  };

  return (
    <div className="max-w-sm w-full space-y-8">
      <h2 className="text-center text-3xl font-semibold tracking-tight text-slate-900 dark:text-foreground">
        Đăng nhập
      </h2>
      <p className="mt-2 text-center text-sm text-slate-500 dark:text-muted-foreground">
        Đăng nhập để đồng bộ công việc trên các thiết bị.
      </p>
      <form className="mt-7 space-y-5" onSubmit={handleLogin}>
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 dark:text-foreground">
            Email
          </label>
          <Input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email"
            className="mt-1.5 h-11 text-base"
          />
        </div>
        <div>
          <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 dark:text-foreground">
            Mật khẩu
          </label>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              className="mt-1.5 h-11 pr-10 text-base"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-emerald-600"
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>
        </div>
        <div className="pt-1">
          <Button
            type="submit"
            className="h-11 w-full bg-emerald-500 text-base text-white hover:bg-emerald-600"
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600 dark:text-muted-foreground">
        Bạn chưa có tài khoản?{" "}
        <Link
          to="/sign-up"
          className="font-semibold text-emerald-700 hover:text-emerald-600 dark:text-emerald-300"
        >
          Đăng ký
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
