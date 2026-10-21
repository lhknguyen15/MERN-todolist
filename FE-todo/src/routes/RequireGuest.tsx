import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { Button } from "../components/ui/button";
import axiosClient from "../apis/axiosClient";
import { logout, setUser } from "../redux/slices/authSlice";

interface User {
  id: string;
  username: string;
  email: string;
}

type GuestRouteStatus = "checking" | "guest" | "authorized" | "error";

const RequireGuest = () => {
  const dispatch = useDispatch();
  const [status, setStatus] = useState<GuestRouteStatus>("checking");
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
          setStatus("guest");
          return;
        }
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [attempt, dispatch]);

  if (status === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6faf7] text-slate-600 dark:bg-background dark:text-muted-foreground">
        <p role="status">Đang kiểm tra phiên đăng nhập...</p>
      </main>
    );
  }

  if (status === "authorized") {
    return <Navigate to="/dashboard" replace />;
  }

  if (status === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6faf7] px-4 dark:bg-background">
        <section className="w-full max-w-md space-y-4 rounded-xl border bg-white p-6 text-center dark:border-border dark:bg-card">
          <h1 className="text-lg font-semibold">Không kiểm tra được phiên đăng nhập</h1>
          <p className="text-sm text-muted-foreground">
            Vui lòng kiểm tra kết nối mạng rồi thử lại.
          </p>
          <Button onClick={() => setAttempt((value) => value + 1)}>Thử lại</Button>
        </section>
      </main>
    );
  }

  return <Outlet />;
};

export default RequireGuest;
