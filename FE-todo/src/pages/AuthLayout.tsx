import React from "react";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex bg-green-400 items-center justify-center w-full">
        <h1 className="text-white text-4xl font-extrabold max-w-md leading-relaxed p-8">
          Welcome to Todos
        </h1>
      </div>
      <div className="flex flex-col w-full md:w-1/2 items-center justify-center p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
