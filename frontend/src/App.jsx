import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useEffect } from "react";
import WelcomePage from "./components/landing_page/WelcomePage";
import Dashboard from "./components/dashboard/Dashboard";
import TaskList from "./components/tasks/TaskList";
import Layout from "./components/Layout/Layout";
import Notifications from "./components/dashboard/Notifications";
import Settings from "./components/dashboard/Settings";
import Habits from "./components/dashboard/Habits";
import HabitCalendar from "./components/dashboard/HabitCalendar";
import Analytics from "./components/dashboard/Analytics";

function SessionWatcher() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleSessionExpired = () => {
      navigate("/");
    };

    window.addEventListener("session-expired", handleSessionExpired);
    return () =>
      window.removeEventListener("session-expired", handleSessionExpired);
  }, [navigate]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <SessionWatcher />
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route element={<Layout />}>
          <Route path="/home" element={<Dashboard />} />
          <Route path="/home/tasks" element={<TaskList />} />
          <Route path="/home/notifications" element={<Notifications />} />
          <Route path="/home/settings" element={<Settings />} />
          <Route path="/home/habits" element={<Habits />} />
          <Route path="/home/habit-calendar" element={<HabitCalendar />} />
          <Route path="/home/analytics" element={<Analytics />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}