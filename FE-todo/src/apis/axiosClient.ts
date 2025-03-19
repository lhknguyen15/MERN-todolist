import axios from "axios";
import store from "../redux/store"; // Import store để gọi dispatch
import { refreshAccessToken, logout } from "../redux/slices/authSlice";

const axiosClient = axios.create({
  baseURL: "http://localhost:3001/api",
  withCredentials: true, // Quan trọng để gửi cookie refreshToken
});

// Interceptor để xử lý token hết hạn
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await store.dispatch(refreshAccessToken()).unwrap();

        // Cập nhật token mới trong header
        axiosClient.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

        return axiosClient(originalRequest); // Gửi lại request ban đầu
      } catch (err) {
        console.log(err);
        store.dispatch(logout()); // Nếu refresh token thất bại thì logout
      }
    }

    return Promise.reject(error);
  }
);

// Interceptor để tự động thêm access token vào request
axiosClient.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return config;
});

export default axiosClient;
