import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AddTodoModal from "../../components/Todo/AddTodoModal";

import { logout } from "../../redux/slices/authSlice";
import { RootState } from "../../redux/store";
import NavBar from "./NavBar";
import TodoList from "@/components/Todo/TodoList";

interface DecodedToken {
  exp: number;
}

const Home = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [refresh, setRefresh] = useState(false); // Thêm state để trigger cập nhật danh sách todo
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/sign-in");
      return;
    }

    try {
      const { exp } = jwtDecode<DecodedToken>(token);
      if (exp * 1000 < Date.now()) {
        dispatch(logout());
        navigate("/sign-in");
      }
    } catch (error) {
      console.error("Lỗi xác thực token:", error);
      dispatch(logout());
      navigate("/sign-in");
    }
  }, [token, dispatch, navigate]);

  return (
    <div className="relative">
      <NavBar onSearch={setSearchTerm} />
      <TodoList searchTerm={searchTerm} refresh={refresh} />
      {/* Truyền refresh xuống TodoList */}
      {/* Nút mở modal */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-4 text-4xl rounded-lg shadow-lg hover:bg-green-700 cursor-pointer transition-all"
      >
        +
      </button>
      {/* Modal thêm todo */}
      <AddTodoModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onTodoAdded={() => setRefresh(!refresh)}
      />
    </div>
  );
};

export default Home;
