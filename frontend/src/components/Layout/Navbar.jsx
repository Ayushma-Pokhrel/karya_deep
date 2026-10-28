import { useState, useEffect, useRef } from "react";
import User from "../../hooks/useUser";
import DarkModeToggle from "../DarkModeToggle";
import { fetchNotifications } from "../../api/api";
import { FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const user = User();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await fetchNotifications();
        setNotifications(data.notifications);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    };
    loadNotifications();
    const interval = setInterval(loadNotifications, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDue = (dueDate) => {
    const date = new Date(dueDate);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <nav className="flex justify-between items-center py-2 px-4 sm:px-6 md:px-8 bg-navbar dark:bg-gray-900 shadow-md sticky top-0 z-10 shrink-0">
        <h2 className="font-logo font-bold text-base sm:text-lg italic text-white cursor-pointer">
          NextUp
        </h2>

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <DarkModeToggle />

              {/* Notification bell */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown((v) => !v)}
                  className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <FaBell className="text-white" size={16} />
                  {notifications.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {notifications.length > 9 ? "9+" : notifications.length}
                    </span>
                  )}
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-border dark:border-gray-700 rounded-md shadow-lg z-20 max-h-80 overflow-y-auto">
                    <div className="px-4 py-2 border-b border-border dark:border-gray-700">
                      <h3 className="text-sm font-semibold text-logo dark:text-white">
                        Notifications
                      </h3>
                    </div>
                    {notifications.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-6">
                        You're all caught up.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => {
                            setShowDropdown(false);
                            navigate("/home/tasks");
                          }}
                          className="w-full text-left px-4 py-2.5 border-b border-border dark:border-gray-700 last:border-0 hover:bg-primary/10 dark:hover:bg-gray-700 transition-colors"
                        >
                          <p className="text-sm text-logo dark:text-white font-medium truncate">
                            {n.title}
                          </p>
                          <p
                            className={`text-xs mt-0.5 ${
                              n.type === "overdue"
                                ? "text-red-500 font-medium"
                                : "text-gray-400"
                            }`}
                          >
                            {n.type === "overdue" ? "⚠ Overdue · " : "Due · "}
                            {formatDue(n.due_date)}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-full bg-white/15 border border-white/20">
                <div className="w-7 h-7 rounded-full bg-white/25 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-white text-sm font-medium">
                  {user.username}
                </span>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse" />
          )}
        </div>
      </nav>
    </div>
  );
}