import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import axiosClient from "../../apis/axiosClient";

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthResponse {
  user: User;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

const getErrorMessage = (error: unknown, fallback: string): string =>
  axios.isAxiosError<{ error?: string; message?: string }>(error)
    ? error.response?.data?.error || error.response?.data?.message || fallback
    : "Đã xảy ra lỗi!";

export const signUpUser = createAsyncThunk<
  AuthResponse,
  { username: string; email: string; password: string },
  { rejectValue: string }
>("auth/signUpUser", async (userData, { rejectWithValue }) => {
  try {
    const response = await axiosClient.post<AuthResponse>("/auth/register", userData);
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, "Đăng ký thất bại!"));
  }
});

export const loginUser = createAsyncThunk<
  AuthResponse,
  { email: string; password: string },
  { rejectValue: string }
>("auth/loginUser", async (userData, { rejectWithValue }) => {
  try {
    const response = await axiosClient.post<AuthResponse>("/auth/login", userData);
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, "Đăng nhập thất bại!"));
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Đăng nhập thất bại!";
      })
      .addCase(signUpUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Đăng ký thất bại!";
      });
  },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;