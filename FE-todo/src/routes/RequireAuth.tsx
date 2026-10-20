import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import axiosClient from "../apis/axiosClient";
import { logout, setUser } from "../redux/slices/authSlice";
import { RootState } from "../redux/store";

interface User {
  id: string;
  username: string;
  email: string;
}

type AuthStatus = "checking" | "authorized" | "unauthorized" | "error";

const RequireAuth = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    axiosClient
      .get<User>("/auth/me")
      .then(({ data }) => {
        if (!active) return;
        dispatch(setUser(data));
        setStatus("authorized");
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          dispatch(logout());
          setStatus("unauthorized");
          return;
        }
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [attempt, dispatch]);

  useEffect(() => {
    if (status === "authorized" && !user) {
      setStatus("unauthorized");
    }
  }, [status, user]);

  if (status === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6faf7] text-slate-600 dark:bg-background dark:text-muted-foreground">
        <p role="status">Đang xác minh phiên đăng nhập...</p>
      </main>
    );
  }

  if (status === "unauthorized") {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  if (status === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6faf7] px-4 dark:bg-background">
        <section className="w-full max-w-md space-y-4 rounded-xl border bg-white p-6 text-center dark:border-border dark:bg-card">
          <h1 className="text-lg font-semibold">Không xác minh được tài khoản</h1>
          <p className="text-sm text-muted-foreground">
            Vui lòng kiểm tra kết nối mạng rồi thử lại. Phiên đăng nhập của bạn chưa bị thay đổi.
          </p>
          <Button onClick={() => setAttempt((value) => value + 1)}>
            Thử lại
          </Button>
        </section>
      </main>
    );
  }

  return <Outlet />;
};

export default RequireAuth;
