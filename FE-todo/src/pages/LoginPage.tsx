import { useState } from "react";
import { Link } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="max-w-sm w-full space-y-8">
      <h2 className="mt-6 text-center text-3xl font-extrabold text-green-600">
        Đăng nhập
      </h2>
      <form className="mt-8 space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Mật khẩu
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <AiOutlineEyeInvisible className="text-black" size={20} />
              ) : (
                <AiOutlineEye className="text-black" size={20} />
              )}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember_me"
              name="remember_me"
              type="checkbox"
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label
              htmlFor="remember_me"
              className="ml-2 block text-sm font-medium text-green-600"
            >
              Ghi nhớ
            </label>
          </div>

          <div className="text-sm">
            <a
              href="#!"
              className="font-medium text-green-600 hover:text-green-500"
            >
              Quên mật khẩu?
            </a>
          </div>
        </div>
        <div>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 
                           border border-transparent text-sm font-medium 
                           rounded-md text-white bg-green-400 hover:bg-green-700 
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 cursor-pointer"
          >
            Đăng nhập
          </button>
        </div>
      </form>
      <p className="mt-2 text-center text-sm text-gray-600">
        Bạn chưa có tài khoản?{" "}
        <Link
          to={"/sign-up"}
          className="font-medium text-green-600 hover:text-green-500"
        >
          Đăng ký
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
