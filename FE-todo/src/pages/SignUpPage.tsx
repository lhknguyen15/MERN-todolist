import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignUpPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const validateEmail = (email: string) => {
    // Regex đơn giản để kiểm tra email
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  // Validate fullName không chứa số (sử dụng regex hoặc kiểm tra đơn giản)
  const validateFullName = (name: string) => {
    // Nếu tên chứa số, trả về false
    return !/\d/.test(name);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate họ tên
    if (!fullName.trim()) {
      toast.error("Họ tên không được để trống!");
      return;
    }
    if (!validateFullName(fullName)) {
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

    // Nếu mọi validate đều thành công
    toast.success("Đăng ký thành công!");
    console.log("Họ tên:", fullName);
    console.log("Email:", email);
    console.log("Mật khẩu:", password);
    // Ở đây bạn có thể gọi API đăng ký, sau đó xử lý tiếp
  };

  return (
    <div className="max-w-sm w-full space-y-8">
      <h2 className="mt-6 text-center text-3xl font-extrabold text-green-600">
        Đăng ký
      </h2>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-gray-700"
          >
            Họ và tên
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nhập họ và tên"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Mật khẩu
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Xác nhận mật khẩu
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Nhập lại mật khẩu"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
          />
        </div>
        <div>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-400 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 cursor-pointer"
          >
            Đăng ký
          </button>
        </div>
      </form>
      <p className="mt-2 text-center text-sm text-gray-600">
        Bạn đã có tài khoản?{" "}
        <Link
          to="/sign-in"
          className="font-medium text-green-600 hover:text-green-500"
        >
          Đăng nhập
        </Link>
      </p>
    </div>
  );
};

export default SignUpPage;
