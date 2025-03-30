import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loginUser } from "../redux/slices/authSlice";
import { AppDispatch, RootState } from "../redux/store";
const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }))
      .unwrap()
      .then((response) => {
        console.log(response.data);
        navigate("/home"); // chuyển hướng sau khi đăng nhập thành công
        toast.success("Đăng nhập thành công!");
      })
      .catch((error) => {
        toast.error(error);
      });
  };

  return (
    <div className="max-w-sm w-full space-y-8">
      <h2 className="mt-6 text-center text-3xl font-extrabold text-green-600">
        Đăng nhập
      </h2>
      <form className="mt-8 space-y-6" onSubmit={handleLogin}>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Mật khẩu
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <AiOutlineEyeInvisible className="text-gray-400" size={20} />
              ) : (
                <AiOutlineEye className="text-gray-400" size={20} />
              )}
            </button>
          </div>
        </div>
        <div>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 
                           border border-transparent text-sm font-medium 
                           rounded-md text-white bg-green-400 hover:bg-green-700 
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 cursor-pointer"
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </div>
      </form>
      <p className="mt-2 text-center text-sm text-gray-600">
        Bạn chưa có tài khoản?{" "}
        <Link
          to="/sign-up"
          className="font-medium text-green-600 hover:text-green-500"
        >
          Đăng ký
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
