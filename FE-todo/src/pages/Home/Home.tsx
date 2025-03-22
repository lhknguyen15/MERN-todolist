import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { RootState } from "../../redux/store";
import { logout } from "../../redux/slices/authSlice";
import NavBar from "./NavBar";
import TodoList from "../../components/Todo/Todolist";

interface DecodedToken {
  exp: number;
}

const Home = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
      console.log(error);
      dispatch(logout());
      navigate("/sign-in");
    }
  }, [token, dispatch, navigate]);

  return (
    <div>
      <NavBar />
      <TodoList />
    </div>
  );
};

export default Home;
