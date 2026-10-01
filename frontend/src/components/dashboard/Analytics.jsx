import { useState, useEffect, useCallback } from "react";
import {
  fetchTasks,
  fetchHabitCalendar,
  fetchHabitNudge,
  toggleHabitCompletion,
} from "../../api/api";
import { FaSpinner, FaFire, FaSyncAlt, FaCheck } from "react-icons/fa";
import { getHabitIcon } from "../../utils/habitIcons";

const DAYS_TO_SHOW = 7;

export default function Analytics() {
  const [habits, setHabits] = useState([]);
  const [calendars, setCalendars] = useState({});
  const [nudges, setNudges] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const allTasks = await fetchTasks();
      const activeHabits = allTasks.filter((t) => t.is_habit);
      setHabits(activeHabits);

      const [calendarResults, nudgeResults] = await Promise.all([
        Promise.all(
          activeHabits.map((h) =>
            fetchHabitCalendar(h.id, DAYS_TO_SHOW).catch(() => null),
          ),
        ),
        Promise.all(
          activeHabits.map((h) => fetchHabitNudge(h.id).catch(() => null)),
        ),
      ]);

      const calendarMap = {};
      const nudgeMap = {};
      activeHabits.forEach((h, i) => {
        if (calendarResults[i]) {
          calendarMap[h.id] = calendarResults[i];
        }
        if (nudgeResults[i]) {
          nudgeMap[h.id] = nudgeResults[i];
        }
      });
      setCalendars(calendarMap);
      setNudges(nudgeMap);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => load(false));
  }, [load]);

  const handleToggle = async (taskId) => {
    setTogglingId(taskId);
    try {
      await toggleHabitCompletion(taskId);
      // Re-fetch this habit's calendar so streak/heatmap reflect the change immediately
      const updatedCalendar = await fetchHabitCalendar(
        taskId,
        DAYS_TO_SHOW,
      ).catch(() => null);
      if (updatedCalendar) {
        setCalendars((prev) => ({ ...prev, [taskId]: updatedCalendar }));
      }
    } catch (err) {
      console.error("Failed to toggle habit:", err);
    } finally {
      setTogglingId(null);
    }
  };

  const buildCells = (completedDates = []) => {
    const completedSet = new Set(completedDates);
    const cells = [];
    for (let i = DAYS_TO_SHOW - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      cells.push({ date: iso, done: completedSet.has(iso) });
    }
    return cells;
  };

  const calcStreak = (completedDates = []) => {
    const completedSet = new Set(completedDates);
    let streak = 0;
    for (let i = 0; i < DAYS_TO_SHOW; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      if (completedSet.has(iso)) {
        streak++;
      } else if (i === 0) {
        continue; // today not done yet, don't break streak on day 0
      } else {
        break;
      }
    }
    return streak;
  };

  const calcRate = (completedDates = []) => {
    if (DAYS_TO_SHOW === 0) return 0;
    return Math.round((completedDates.length / DAYS_TO_SHOW) * 100);
  };

  return (
    <div className="flex flex-col bg-secondary dark:bg-black min-h-full">
      {/* Topbar */}
      <div className="flex justify-between items-center py-3 px-8 bg-secondary dark:bg-gray-800 shadow-md sticky top-0 z-10 shrink-0">
        <h1 className="font-medium text-xl text-logo dark:text-white font-poppins">
          Analytics
        </h1>
        <button
          onClick={() => load(true)}
          disabled={refreshing || loading}
          className="flex items-center gap-2 text-xs font-medium text-accent hover:text-accent/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Refresh analytics"
        >
          <FaSyncAlt size={12} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-4">
        {loading ? (
          <p className="text-gray-400 text-sm flex items-center gap-2 mt-10 justify-center">
            <FaSpinner className="animate-spin" size={14} /> Loading
            analytics...
          </p>
        ) : habits.length === 0 ? (
          <p className="text-gray-400 text-sm text-center mt-10">
            No active habits yet. Add some from the Habits tab to see your
            progress here.
          </p>
        ) : (
          habits.map((habit) => {
            const calendar = calendars[habit.id];
            const completedDates = calendar?.completed_dates || [];
            const cells = buildCells(completedDates);
            const streak = calcStreak(completedDates);
            const rate = calcRate(completedDates);
            const Icon = getHabitIcon(habit.category);
            const nudge = nudges[habit.id];
            const todayIso = new Date().toISOString().slice(0, 10);
            const todayDone = completedDates.includes(todayIso);
            const isToggling = togglingId === habit.id;

            return (
              <div
                key={habit.id}
                className="bg-primary/30 dark:bg-gray-800 border border-border dark:border-gray-700 rounded-md p-4 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Icon className="text-accent shrink-0" size={16} />
                    <h3 className="text-sm font-semibold text-logo dark:text-white font-poppins">
                      {habit.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <button
                      onClick={() => handleToggle(habit.id)}
                      disabled={isToggling}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        todayDone
                          ? "bg-accent text-white hover:bg-accent/90"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                      title={
                        todayDone
                          ? "Mark as not done today"
                          : "Mark as done today"
                      }
                    >
                      <FaCheck size={10} />
                      {isToggling
                        ? "..."
                        : todayDone
                          ? "Done today"
                          : "Mark done"}
                    </button>
                    <span className="flex items-center gap-1 text-accent font-medium">
                      <FaFire size={12} />
                      {streak} day{streak !== 1 ? "s" : ""} streak
                    </span>
                    <span className="text-gray-400">
                      {rate}% last {DAYS_TO_SHOW} days
                    </span>
                  </div>
                </div>

                {/* Heatmap */}
                <div className="flex flex-wrap gap-1">
                  {cells.map((cell) => (
                    <div
                      key={cell.date}
                      title={`${cell.date}${cell.done ? " — done" : ""}`}
                      className={`w-3.5 h-3.5 rounded-sm transition-colors ${
                        cell.done ? "bg-accent" : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  ))}
                </div>

                {/* AI habit nudge */}
                {nudge && (
                  <p className="text-xs text-accent/90 italic border-t border-border dark:border-gray-700 pt-2 mt-1">
                    💡 {nudge.message}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}