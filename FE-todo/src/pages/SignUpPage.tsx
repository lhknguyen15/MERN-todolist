import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { signUpUser } from "../redux/slices/authSlice";
import { AppDispatch, RootState } from "../redux/store";

const SignUpPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    // Regex đơn giản để kiểm tra email
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  // Validate fullName không chứa số (sử dụng regex hoặc kiểm tra đơn giản)
  const validateUsername = (name: string) => {
    // Nếu tên chứa số, trả về false
    return !/\d/.test(name);
  };

  const handleSignup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate họ tên
    if (!username.trim()) {
      toast.error("Họ tên không được để trống!");
      return;
    }
    if (!validateUsername(username)) {
      toast.error("Họ tên không được chứa số!");
      return;
    }

    // Validate email
    if (!email.trim()) {
      toast.error("Email không được để trống!");
      return;
    }
    if (!validateEmail(email)) {
      toast.error("Email không hợp lệ!");
      return;
    }

    // Validate mật khẩu
    if (!password) {
      toast.error("Mật khẩu không được để trống!");
      return;
    }
    if (password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    // Validate xác nhận mật khẩu
    if (password !== confirmPassword) {
      toast.error("Mật khẩu và xác nhận mật khẩu không khớp!");
      return;
    }
    dispatch(signUpUser({ username, email, password }))
      .unwrap()
      .then(() => {
        navigate("/dashboard", { replace: true });
        toast.success("Đăng ký thành công");
      })
      .catch((err) => {
        toast.error(err);
        console.log(err);
      });
  };

  return (
    <div className="max-w-sm w-full space-y-8">
      <h2 className="text-center text-3xl font-semibold tracking-tight text-slate-900 dark:text-foreground">
        Đăng ký
      </h2>
      <p className="mt-2 text-center text-sm text-slate-500 dark:text-muted-foreground">
        Tạo tài khoản để lưu công việc của bạn.
      </p>
      <form className="mt-7 space-y-4" onSubmit={handleSignup}>
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-slate-700 dark:text-foreground"
          >
            Họ và tên
          </label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nhập họ và tên"
            className="mt-1.5 h-11 text-base"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700 dark:text-foreground"
          >
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email"
            className="mt-1.5 h-11 text-base"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-700 dark:text-foreground"
          >
            Mật khẩu
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu"
            className="mt-1.5 h-11 text-base"
          />
        </div>
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-slate-700 dark:text-foreground"
          >
            Xác nhận mật khẩu
          </label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Nhập lại mật khẩu"
            className="mt-1.5 h-11 text-base"
          />
        </div>
        <div className="pt-1">
          <Button
            type="submit"
            className="h-11 w-full bg-emerald-500 text-base text-white hover:bg-emerald-600"
            disabled={loading}
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </Button>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600 dark:text-muted-foreground">
        Bạn đã có tài khoản?{" "}
        <Link
          to="/sign-in"
          className="font-semibold text-emerald-700 hover:text-emerald-600 dark:text-emerald-300"
        >
          Đăng nhập
        </Link>
      </p>
    </div>
  );
};

export default SignUpPage;
