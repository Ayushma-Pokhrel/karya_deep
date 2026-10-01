import { useState, useEffect } from "react";
import { fetchHabitCalendar, generateHabitNudge } from "../../api/api";

const CALENDAR_DAYS = 7;

// Local-date ISO string, avoiding the UTC shift toISOString() introduces
const toLocalISODate = (d) => {
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
};

export default function HabitCalendar({ taskId }) {
  const [completedDates, setCompletedDates] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [nudge, setNudge] = useState(null);
  const [nudgeLoading, setNudgeLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchHabitCalendar(taskId, CALENDAR_DAYS);
        setCompletedDates(new Set(data.completed_dates));
      } catch (err) {
        console.error("Failed to load habit calendar:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [taskId]);

  useEffect(() => {
    if (loading) return;
    const loadNudge = async () => {
      setNudgeLoading(true);
      try {
        const data = await generateHabitNudge(taskId);
        setNudge(data.message);
      } catch (err) {
        console.error("Failed to generate habit nudge:", err);
      } finally {
        setNudgeLoading(false);
      }
    };
    loadNudge();
  }, [loading, taskId]);

  if (loading) {
    return <p className="text-xs text-gray-400">Loading calendar...</p>;
  }

  const cells = [];
  for (let i = CALENDAR_DAYS - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = toLocalISODate(d);
    cells.push({ date: iso, done: completedDates.has(iso) });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1">
        {cells.map((cell) => (
          <div
            key={cell.date}
            title={cell.date}
            className={`w-3.5 h-3.5 rounded-sm ${
              cell.done ? "bg-accent" : "bg-gray-200 dark:bg-gray-700"
            }`}
          />
        ))}
      </div>
      {nudgeLoading ? (
        <p className="text-xs text-gray-400">Thinking of something to say...</p>
      ) : nudge ? (
        <p className="text-xs text-accent italic">{nudge}</p>
      ) : null}
    </div>
  );
}