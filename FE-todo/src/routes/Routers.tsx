import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import AuthLayout from "../pages/AuthLayout";
import Home from "../pages/Home/Home";
import LoginPage from "../pages/LoginPage";
import MainLayout from "../pages/MainLayout";
import SignUpPage from "../pages/SignUpPage";

const Routers = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthLayout />}>
            <Route index element={<LoginPage />} />
            <Route path="sign-in" element={<LoginPage />} />
            <Route path="sign-up" element={<SignUpPage />} />
          </Route>
          <Route path="/" element={<MainLayout />}>
            <Route path="/home" element={<Home />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-center" autoClose={2000} />
    </>
  );
};

export default Routers;
