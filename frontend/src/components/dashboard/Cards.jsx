import { useState, useEffect } from "react";
import { fetchTasks } from "../../api/api";

export default function Cards(){
    const [counts, setCounts] = useState({
        total: 0,
        completed: 0,
        inProgress: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCounts = async () => {
            try{
                const tasks = await fetchTasks();
                const total = tasks.length;
                const completed = tasks.filter((t) => t.is_completed).length;
                const inProgress = total - completed;
                setCounts({ total, completed, inProgress });
            } catch {
                console.error("Failed to fetch task counts");
            } finally {
                setLoading(false);
            }
        };
        loadCounts();
    }, []);

    const cardList = [
    { id: 1, title: "Total Tasks", value: counts.total },
    { id: 2, title: "Completed Tasks", value: counts.completed },
    { id: 3, title: "In Progress", value: counts.inProgress },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {cardList.map((card) => (
        <div
          key={card.id}
          className="bg-primary/30 dark:bg-gray-800 shadow-lg cursor-pointer rounded-md p-4 hover:translate-y-1 transition-all"
        >
          <h3 className="text-lg font-semibold text-logo dark:text-white">
            {card.title}
          </h3>
          <p className="text-2xl font-bold text-accent mt-1">
            {loading ? "…" : card.value}
          </p>
        </div>
      ))}
    </div>
  );
}