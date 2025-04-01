import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice";

interface NavBarProps {
  onSearch: (term: string) => void;
}

const NavBar: React.FC<NavBarProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showLogout, setShowLogout] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleLogout = () => {
    dispatch(logout());
    navigate("/sign-in");
  };
  const handleSearchClick = () => {
    onSearch(searchTerm.trim());
    console.log(searchTerm);
  };
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-green-600 shadow-md">
      {/* Logo hoặc Tiêu đề */}
      <h1 className="text-3xl font-extrabold text-white">Todos</h1>

      {/* Thanh tìm kiếm */}
      <div className="relative flex w-1/3">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 pl-4 border rounded-l-md focus:outline-none bg-white border-white"
        />
        <button
          className="px-6 py-1 bg-green-700 text-white rounded-r-md hover:bg-black-600"
          onClick={handleSearchClick} // Gọi hàm khi click
        >
          <FiSearch />
        </button>
      </div>

      {/* Avatar và nút Logout */}
      <div className="relative flex items-center gap-4">
        <div className="relative">
          <FaUserCircle
            className="text-2xl text-white cursor-pointer"
            onClick={() => setShowLogout(!showLogout)}
          />
          {showLogout && (
            <button
              className="absolute right-0 mt-2 w-24 bg-white text-black text-sm py-1 px-2 rounded-md shadow-md hover:bg-gray-200"
              onClick={handleLogout}
            >
              Đăng xuất
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
