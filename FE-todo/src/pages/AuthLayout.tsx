import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex">
      <div className="flex-col hidden md:flex bg-green-400 items-center justify-center w-full">
        <img className="w-52 h-auto bg-white rounded-lg p-2" src="logo.png" />
        <h1 className="text-white text-2xl font-extrabold max-w-md leading-relaxed p-2">
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
