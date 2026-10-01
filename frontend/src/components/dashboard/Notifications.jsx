import { useState, useEffect } from "react";
import { FaBell, FaExclamationCircle, FaClock } from "react-icons/fa";
import { fetchNotifications } from "../../api/api";
import { useNavigate } from "react-router-dom";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "overdue", label: "Overdue" },
  { key: "upcoming", label: "Upcoming" },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await fetchNotifications();
        setNotifications(data.notifications);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        setLoading(false);
      }
    };
    loadNotifications();
  }, []);

  const formatDue = (dueDate) => {
    const date = new Date(dueDate);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredNotifications = notifications.filter((n) =>
    filter === "all" ? true : n.type === filter,
  );

  const overdueCount = notifications.filter((n) => n.type === "overdue").length;
  const upcomingCount = notifications.filter(
    (n) => n.type === "upcoming",
  ).length;

  return (
    <div className="flex flex-col bg-secondary dark:bg-black min-h-full">
      {/* Topbar */}
      <div className="flex justify-between items-center py-3 px-4 sm:px-8 bg-secondary dark:bg-gray-800 shadow-md sticky top-0 z-10 shrink-0">
        <h1 className="font-medium text-xl text-logo dark:text-white font-poppins flex items-center gap-2">
          <FaBell className="text-accent" size={18} />
          Notifications
        </h1>
      </div>

      <div className="flex-1 p-4 sm:p-6 flex flex-col gap-4">
        {/* Filter tabs */}
        <div className="flex gap-2">
          {FILTERS.map((f) => {
            const count =
              f.key === "all"
                ? notifications.length
                : f.key === "overdue"
                  ? overdueCount
                  : upcomingCount;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === f.key
                    ? "bg-accent text-white"
                    : "bg-white dark:bg-gray-800 text-logo dark:text-white border border-border dark:border-gray-700 hover:bg-accent/10"
                }`}
              >
                {f.label} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>

        {/* List */}
        {loading ? (
          <p className="text-gray-400 text-sm text-center mt-10">Loading...</p>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-16 gap-2">
            <FaBell className="text-gray-300 dark:text-gray-600" size={32} />
            <p className="text-gray-400 text-sm">You're all caught up.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredNotifications.map((n) => (
              <button
                key={n.id}
                onClick={() => navigate("/home/tasks")}
                className={`flex items-start gap-3 text-left bg-primary/30 dark:bg-gray-800 border rounded-md px-4 py-3 hover:bg-primary/5 dark:hover:bg-gray-700 transition-colors ${
                  n.type === "overdue"
                    ? "border-red-200 dark:border-red-900"
                    : "border-border dark:border-gray-700"
                }`}
              >
                <div
                  className={`mt-0.5 shrink-0 ${
                    n.type === "overdue" ? "text-red-500" : "text-accent"
                  }`}
                >
                  {n.type === "overdue" ? (
                    <FaExclamationCircle size={16} />
                  ) : (
                    <FaClock size={16} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-logo dark:text-white truncate">
                    {n.title}
                  </p>
                  <p
                    className={`text-xs mt-0.5 ${
                      n.type === "overdue"
                        ? "text-red-500 font-medium"
                        : "text-gray-400"
                    }`}
                  >
                    {n.type === "overdue" ? "Overdue since " : "Due "}
                    {formatDue(n.due_date)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}