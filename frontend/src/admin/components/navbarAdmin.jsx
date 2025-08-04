import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/Dewasaku_putih.png"; // Adjust the path as necessary
import { logout } from "../../../../backend/utils/auth";

const NavbarAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Daftar route yang ada di navbar admin
  const navItems = [
    { path: "/admin", name: "Beranda" },
    { path: "/admin/database-anggota", name: "Database" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    localStorage.removeItem("tokenExpiration");
    console.log("Admin logged out");
    navigate("/enter"); // Arahkan ke halaman login setelah logout
    logout();
    setShowLogoutModal(false);
  };

  return (
    <>
      <nav className="bg-blue-900 px-4 sm:px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => navigate("/admin")}
          >
            <img
              src={logo}
              className="h-12 sm:h-16 object-contain"
              alt="Logo Racana Diponegoro"
            />
          </div>

          {/* Navigation links */}
          <div className="flex space-x-4 sm:space-x-8">
            {navItems.map((item) => (
              <div
                key={item.path}
                className="relative group text-white font-medium text-sm sm:text-base cursor-pointer"
                onClick={() => navigate(item.path)}
              >
                {item.name}
                {/* Garis bawah akan muncul saat hover ATAU saat di halaman aktif */}
                <span
                  className={`
                  absolute left-0 bottom-0 h-0.5 bg-orange-400 
                  transition-all duration-300
                  ${
                    location.pathname === item.path
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }
                `}
                ></span>
              </div>
            ))}

            {/* Tombol Logout */}
            <div
              className="relative group text-white font-medium text-sm sm:text-base cursor-pointer bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md transition-colors"
              onClick={() => setShowLogoutModal(true)}
            >
              Logout
            </div>
          </div>
        </div>
      </nav>

      {/* Modal Konfirmasi Logout */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Konfirmasi Logout</h3>
            <p className="mb-6">Apakah Anda yakin ingin logout?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavbarAdmin;
