import {
  LayoutGrid,
  Heart,
  FileText,
  Calendar,
  UtensilsCrossed,
  Bell,
  Settings,
  MoreVertical,
  LogOut,
  User,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import APIClient from "../api/Api";

const handleLogout = async () => {
  try {
    const logoutapi = new APIClient("/auth/logout");
    await logoutapi.post();
  } catch (err) {
    console.error("Logout failed:", err);
  } finally {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = window.location.origin + "/auth";
  }
};
export { handleLogout };

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {}, []);

  useEffect(() => {
    const name = localStorage.getItem("userName") || "User";
    const email = localStorage.getItem("userEmail") || "";
    setUserName(name);
    setUserEmail(email);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const menuItems = [
    { icon: LayoutGrid, label: "Dashboard", path: "/dashboard" },
    { icon: Heart, label: "Health", path: "/healthreports" },
    { icon: FileText, label: "Reports", path: "/reports" },
    { icon: Calendar, label: "Appointments", path: "/appointments/booking" },
    {
      icon: UtensilsCrossed,
      label: "Diet and Supplements",
      path: "/diteandsupplements",
    },
  ];

  const notificationItems = [
    { icon: Bell, label: "Notifications", path: "/notifications" },
  ];

  const settingsItems = [
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setShowProfileMenu(false);
  };

  const handleProfileClick = () => {
    navigate("/profile");
    setShowProfileMenu(false);
  };

  const toggleProfileMenu = () => {
    console.log("Dropdown toggled!");
    setShowProfileMenu(!showProfileMenu);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "U";
    const names = name.trim().split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <div className="w-64 h-screen bg-gray-200 flex flex-col">
      {/* Logo Section */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-900 to-black rounded-full"></div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Cares a pet lot
            </p>
            <p className="text-base font-semibold text-gray-800">PetCare+</p>
          </div>
        </div>
      </div>

      {/* Main Menu Section */}
      <div className="flex-1 overflow-y-auto px-4">
        {/* MAIN Section */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4 px-3">
            Main
          </h3>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group text-left ${
                  isActive(item.path)
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-800 hover:bg-white hover:shadow-sm"
                }`}
              >
                <item.icon
                  className="w-5 h-5 text-gray-700"
                  strokeWidth={1.5}
                />
                <span className="text-sm font-normal">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* NOTIFICATION Section */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4 px-3">
            Notification
          </h3>
          <nav className="space-y-1">
            {notificationItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group text-left ${
                  isActive(item.path)
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-800 hover:bg-white hover:shadow-sm"
                }`}
              >
                <item.icon
                  className="w-5 h-5 text-gray-700"
                  strokeWidth={1.5}
                />
                <span className="text-sm font-normal">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* SETTINGS Section */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4 px-3">
            Settings
          </h3>
          <nav className="space-y-1">
            {settingsItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group text-left ${
                  isActive(item.path)
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-800 hover:bg-white hover:shadow-sm"
                }`}
              >
                <item.icon
                  className="w-5 h-5 text-gray-700"
                  strokeWidth={1.5}
                />
                <span className="text-sm font-normal">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Logout Button (Standalone) - WITH CONSOLE LOG */}
      <div className="px-4 pb-4">
        <button
          onClick={() => {
            handleLogout();
          }}
          className="w-full flex items-center gap-3 px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group text-left"
          style={{ border: "2px solid red" }} // VISUAL TEST - you'll see red border
        >
          <LogOut className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-sm font-normal">Logout [NEW]</span>
        </button>
      </div>

      {/* Profile Section with Dropdown */}
      <div
        className="p-4 border-t border-gray-300 relative"
        ref={profileMenuRef}
      >
        <div className="flex items-center justify-between px-3 py-2 bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-900 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {getInitials(userName)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-800">
                {userName || "User"}
              </span>
              {userEmail && (
                <span className="text-xs text-gray-500 truncate max-w-[120px]">
                  {userEmail}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={toggleProfileMenu}
            className="text-gray-700 hover:text-gray-900 transition-colors"
          >
            <MoreVertical className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Dropdown Menu */}
        {showProfileMenu && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
            <button
              onClick={handleProfileClick}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-gray-50 transition-colors text-left"
            >
              <User className="w-5 h-5 text-gray-700" strokeWidth={1.5} />
              <span className="text-sm font-medium">Profile</span>
            </button>
            <button
              onClick={() => {
                console.log("🔴 DROPDOWN LOGOUT CLICKED");
                handleLogout();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors text-left border-t border-gray-200"
            >
              <LogOut className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-sm font-medium">Logout [NEW]</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
