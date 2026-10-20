import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import AuthLayout from "../pages/AuthLayout";
import Home from "../pages/Home/Home";
import LoginPage from "../pages/LoginPage";
import SignUpPage from "../pages/SignUpPage";
import RequireAuth from "./RequireAuth";

const Routers = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/dashboard" element={<RequireAuth />}>
            <Route index element={<Home />} />
            <Route path="tasks" element={<Home />} />
            <Route path="account" element={<Home />} />
          </Route>
          <Route element={<AuthLayout />}>
            <Route path="sign-in" element={<LoginPage />} />
            <Route path="sign-up" element={<SignUpPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-center" autoClose={2000} />
    </>
  );
};

export default Routers;
