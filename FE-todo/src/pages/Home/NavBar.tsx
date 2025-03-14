import { FaUserCircle } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";

const NavBar = () => {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white dark:bg-green-600 shadow-md">
      {/* Logo hoặc Tiêu đề */}
      <h1 className="text-3xl font-extrabold text-white">Todos</h1>

      {/* Thanh tìm kiếm */}
      <div className="relative flex w-1/3">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="w-full p-2 pl-4 border rounded-l-md focus:outline-none  bg-white border-white"
        />
        <button className=" px-6 py-1 bg-green-700 text-white rounded-r-md hover:bg-black-600">
          <FiSearch />
        </button>
      </div>

      {/* Avatar và nút chuyển chế độ */}
      <div className="flex items-center gap-4">
        <FaUserCircle className="text-2xl text-white cursor-pointer" />
      </div>
    </nav>
  );
};

export default NavBar;
