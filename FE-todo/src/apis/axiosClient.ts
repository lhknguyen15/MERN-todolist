import axios, { InternalAxiosRequestConfig } from "axios";
import store from "../redux/store";
import { logout } from "../redux/slices/authSlice";

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const apiBaseUrl = `${import.meta.env.VITE_API_URL}/api`;
let csrfToken: string | null = null;

const loadCsrfToken = async () => {
  const response = await axios.get<{ csrfToken: string }>(`${apiBaseUrl}/auth/csrf`, {
    withCredentials: true,
  });
  csrfToken = response.data.csrfToken;
};

const axiosClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

axiosClient.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase();
  const isUnsafeMethod = method && !["get", "head", "options"].includes(method);

  if (isUnsafeMethod && !csrfToken) {
    await loadCsrfToken();
  }

  if (isUnsafeMethod && csrfToken) {
    config.headers["X-CSRF-Token"] = csrfToken;
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => {
    const responseCsrfToken = (response.data as { csrfToken?: unknown } | undefined)
      ?.csrfToken;
    if (typeof responseCsrfToken === "string") {
      csrfToken = responseCsrfToken;
    }
    if (response.config.url?.includes("/auth/logout")) {
      csrfToken = null;
    }
    return response;
  },
  async (error) => {
    const request = error.config as RetryableRequest | undefined;
    const isRefreshRequest = request?.url?.includes("/auth/refresh");

    if (
      error.response?.status !== 401 ||
      !request ||
      request._retry ||
      isRefreshRequest
    ) {
      return Promise.reject(error);
    }

    request._retry = true;
    try {
      await axiosClient.post("/auth/refresh");
      return await axiosClient(request);
    } catch (refreshError) {
      store.dispatch(logout());
      window.location.href = "/sign-in";
      return Promise.reject(refreshError);
    }
  }
);

export default axiosClient;