import "./App.css";
import Routers from "./routes/Routers";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { refreshAccessToken } from "./redux/slices/authSlice";
import { AppDispatch } from "./redux/store"; // Import kiểu AppDispatch

function App() {
  const dispatch = useDispatch<AppDispatch>(); // Sử dụng kiểu chính xác

  useEffect(() => {
    dispatch(refreshAccessToken()); // Tự động refresh token khi app khởi chạy
  }, [dispatch]);

  return <Routers />;
}

export default App;
