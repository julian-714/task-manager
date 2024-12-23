import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const user = localStorage.getItem("user_name");
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("user_name");
    localStorage.removeItem("auth_token");
    localStorage.clear();

    // Redirect to login page
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-16 bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md flex items-center justify-between px-6 z-10">
      <div className="flex items-center space-x-3">
        <h2 className="font-semibold text-2xl text-white">Laravel React App</h2>
      </div>

      <div className="relative" ref={menuRef}>
        <div className="relative" ref={menuRef}>
          <button
            onClick={toggleMenu}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
          >
            <img
              src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
              alt="Profile"
              className="rounded-full object-cover"
            />
          </button>
        </div>

        {isOpen && (
          <div className="absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-lg py-2">
            <div className="px-4 py-3 border-b">
              <p className="text-sm font-medium text-gray-900">Hello, {user}</p>
            </div>
            <div className="py-2 space-y-2">
              <Link
                to="/user-profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600"
              >
                View Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;
