import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import AuthLayout from "./pages/AuthLayout";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import Home from "./pages/Home/Home";
import MainLayout from "./pages/MainLayout";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthLayout />}>
          <Route index element={<LoginPage />} />
          <Route path="sign-in" element={<LoginPage />} />
          <Route path="sign-up" element={<SignUpPage />} />
        </Route>
        <Route path="/" element={<MainLayout />}>
          <Route path="/home" element={<Home />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
