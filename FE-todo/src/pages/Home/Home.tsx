import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import AddTodoModal from "../../components/Todo/AddTodoModal";
import axiosClient from "../../apis/axiosClient";
import { logout, setUser } from "../../redux/slices/authSlice";
import { AppDispatch } from "../../redux/store";
import NavBar from "./NavBar";
import TodoList from "@/components/Todo/TodoList";

interface User {
  id: string;
  username: string;
  email: string;
}

const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let active = true;

    axiosClient
      .get<User>("/auth/me")
      .then(({ data }) => {
        if (active) dispatch(setUser(data));
      })
      .catch(() => {
        if (!active) return;
        dispatch(logout());
        navigate("/sign-in");
      });

    return () => {
      active = false;
    };
  }, [dispatch, navigate]);

  return (
    <div className="relative">
      <NavBar onSearch={setSearchTerm} />
      <TodoList searchTerm={searchTerm} refresh={refresh} />
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-4 text-4xl rounded-lg shadow-lg hover:bg-green-700 cursor-pointer transition-all"
      >
        +
      </button>
      <AddTodoModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onTodoAdded={() => setRefresh(!refresh)}
      />
    </div>
  );
};

export default Home;