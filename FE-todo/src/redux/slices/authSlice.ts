import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "../../apis/axiosClient";
import axios from "axios";

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("accessToken") || null,
  loading: false,
  error: null,
};

// **Async action: Gửi request đăng ký**
export const signUpUser = createAsyncThunk(
  "auth/signUpUser",
  async (
    userData: { username: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosClient.post("/auth/register", userData);
      localStorage.setItem("accessToken", response.data.accessToken);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Đăng ký thất bại!"
        );
      }
      return rejectWithValue("Đã xảy ra lỗi!");
    }
  }
);

// **Async action: Gửi request đăng nhập**
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    userData: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosClient.post("/auth/login", userData);
      localStorage.setItem("accessToken", response.data.accessToken);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Đăng nhập thất bại!"
        );
      }
      return rejectWithValue("Đã xảy ra lỗi!");
    }
  }
);

// **Async action: Refresh Access Token**
export const refreshAccessToken = createAsyncThunk(
  "auth/refreshAccessToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(
        "/auth/refresh-token",
        {},
        { withCredentials: true } // Gửi cookie refreshToken
      );
      if (response.data?.accessToken) {
        localStorage.setItem("accessToken", response.data.accessToken);
        return response.data.accessToken;
      }
      return rejectWithValue("Không nhận được access token mới");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Lỗi khi refresh token!"
        );
      }
      return rejectWithValue("Đã xảy ra lỗi khi refresh token!");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("accessToken");
    },
  },
  extraReducers: (builder) => {
    builder
      // Xử lý đăng nhập
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Xử lý đăng ký
      .addCase(signUpUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Xử lý refresh token
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.token = action.payload;
      })
      .addCase(refreshAccessToken.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
