import axios from "axios";
import store from "../redux/store";
import { logout } from "../redux/slices/authSlice";

const axiosClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true, // Nếu có dùng cookie cho mục đích khác
});

// Interceptor để thêm accessToken vào request
axiosClient.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return config;
});

// Interceptor xử lý lỗi 401 (Unauthorized)
// Trong axiosClient.ts
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      store.dispatch(logout());
      window.location.href = "/sign-in";
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
