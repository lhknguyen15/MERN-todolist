import React from "react";
import { Link } from "react-router-dom";

const SignUpPage = () => {
  return (
    <div className="max-w-sm w-full space-y-8">
      <h2 className="mt-6 text-center text-3xl font-extrabold text-green-600">
        Đăng Ký
      </h2>
      <form className="mt-8 space-y-6">
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700"
          >
            Họ và tên
            <input className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none " />
          </label>
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
            <input className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none " />
          </label>
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
            <input className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none " />
          </label>
        </div>
        <div>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 
                           border border-transparent text-sm font-medium 
                           rounded-md text-white bg-green-400 hover:bg-green-700 
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 cursor-pointer"
          >
            Đăng ký
          </button>
        </div>
      </form>
      <p className="mt-2 text-center text-sm text-gray-600">
        Bạn đã có tài khoản?{" "}
        <Link
          to={"/sign-in"}
          className="font-medium text-green-600 hover:text-green-500"
        >
          Đăng nhập
        </Link>
      </p>
    </div>
  );
};

export default SignUpPage;
