import { useState, useEffect } from "react";
import { FaSearch, FaEdit, FaTrash, FaCheck, FaSync } from "react-icons/fa";
import { fetchTasks, updateTask, deleteTask } from "../../api/api";

const PRIORITY_WEIGHT = { High: 0, Medium: 1, Low: 2 };

export default function TaskList() {
  const [search, setSearch] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [editData, setEditData] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await fetchTasks();
        setTasks(data);
      } catch {
        console.error("Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

  const handleDelete = (task) => setDeleteTarget(task);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTask(deleteTarget.id);
      setTasks((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    } catch {
      console.error("Failed to delete task");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const updated = await updateTask(task.id, {
        is_completed: !task.is_completed,
      });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch {
      console.error("Failed to update task");
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task.id);
    setEditData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      due_date: task.due_date ? task.due_date.slice(0, 16) : "",
    });
  };

  const handleSaveEdit = async (id) => {
    try {
      const updated = await updateTask(id, editData);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setEditingTask(null);
    } catch {
      console.error("Failed to save task");
    }
  };

  const formatDeadline = (due_date) => {
    if (!due_date) return null;
    const date = new Date(due_date);
    const now = new Date();
    const isOverdue = date < now;

    const formatted = date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return { formatted, isOverdue };
  };

  const priorityStyles = {
    High: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    Medium:
      "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
    Low: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  };

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(search.toLowerCase()),
  );

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.is_habit && !b.is_habit) return -1;
    if (!a.is_habit && b.is_habit) return 1;
    if (a.is_habit && b.is_habit) return 0;

    if (a.is_completed && !b.is_completed) return 1;
    if (!a.is_completed && b.is_completed) return -1;

    const priorityDiff =
      PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date) - new Date(b.due_date);
  });

  return (
    <div className="flex flex-col bg-secondary dark:bg-black min-h-full">
      {/* Topbar */}
      <div className="flex justify-between items-center py-3 px-8 bg-secondary dark:bg-gray-800 shadow-md sticky top-0 z-10 shrink-0">
        <h1 className="font-medium text-xl text-logo dark:text-white font-poppins">
          Task lists
        </h1>
        <div className="group relative flex items-center h-9 w-9 hover:w-72 focus-within:w-72 border border-border dark:border-gray-600 rounded-md bg-primary/10 dark:bg-gray-700 focus-within:ring-1 focus-within:ring-accent transition-all duration-300 overflow-hidden">
          <input
            type="text"
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-full pl-3 pr-8 bg-transparent text-sm text-logo dark:text-white outline-none placeholder:text-gray-400"
          />
          <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm shrink-0 pointer-events-none" />
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 p-6 flex flex-col gap-3">
        {loading ? (
          <p className="text-gray-400 text-sm text-center mt-10">Loading...</p>
        ) : sortedTasks.length === 0 ? (
          <p className="text-gray-400 text-sm text-center mt-10">
            No tasks found.
          </p>
        ) : (
          sortedTasks.map((task) => {
            const deadline = formatDeadline(task.due_date);
            const isEditing = editingTask === task.id;

            return (
              <div
                key={task.id}
                className={`bg-primary/30 dark:bg-gray-800 border rounded-md px-4 py-3 flex flex-col gap-2 transition-all ${
                  task.is_completed
                    ? "border-green-200 dark:border-green-800 opacity-70"
                    : task.is_habit
                      ? "border-accent/40 dark:border-accent/40"
                      : "border-border dark:border-gray-700"
                }`}
              >
                {isEditing ? (
                  /* Edit mode */
                  <div className="flex flex-col gap-2">
                    <input
                      value={editData.title}
                      onChange={(e) =>
                        setEditData({ ...editData, title: e.target.value })
                      }
                      className="border border-border rounded-md px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-accent bg-transparent text-logo dark:text-white"
                    />
                    <textarea
                      value={editData.description}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          description: e.target.value,
                        })
                      }
                      rows={2}
                      className="border border-border rounded-md px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-accent resize-none bg-transparent text-logo dark:text-white"
                    />
                    <div className="flex gap-2">
                      <select
                        value={editData.priority}
                        onChange={(e) =>
                          setEditData({ ...editData, priority: e.target.value })
                        }
                        className="border border-border rounded-md px-3 py-1.5 text-sm outline-none bg-white dark:bg-gray-700 text-logo dark:text-white"
                      >
                        {["High", "Medium", "Low"].map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                      {!task.is_habit && (
                        <input
                          type="datetime-local"
                          value={editData.due_date}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              due_date: e.target.value,
                            })
                          }
                          className="border border-border rounded-md px-3 py-1.5 text-sm outline-none flex-1 bg-white dark:bg-gray-700 text-logo dark:text-white"
                        />
                      )}
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setEditingTask(null)}
                        className="px-3 py-1.5 text-sm border border-border rounded-md text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(task.id)}
                        className="px-3 py-1.5 text-sm bg-accent hover:bg-accent-hover text-white rounded-md"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Complete toggle */}
                      <button
                        onClick={() => handleToggleComplete(task)}
                        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          task.is_completed
                            ? "bg-green-500 border-green-500"
                            : "border-gray-300 hover:border-accent"
                        }`}
                      >
                        {task.is_completed && (
                          <FaCheck size={10} className="text-white" />
                        )}
                      </button>

                      {/* Task info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {task.is_habit && (
                            <FaSync
                              className="text-accent shrink-0"
                              size={11}
                            />
                          )}
                          <h3
                            className={`text-sm font-medium ${
                              task.is_completed
                                ? "line-through text-gray-400"
                                : "text-logo dark:text-white"
                            }`}
                          >
                            {task.title}
                          </h3>
                        </div>
                        {task.description && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate">
                            {task.description}
                          </p>
                        )}

                        {/* Deadline + priority, OR recurrence info for habits */}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityStyles[task.priority]}`}
                          >
                            {task.priority}
                          </span>

                          {task.is_habit ? (
                            <span className="text-xs text-accent font-medium">
                              Daily
                              {task.recurrence_times?.length
                                ? ` · ${task.recurrence_times.join(", ")}`
                                : ""}
                            </span>
                          ) : (
                            deadline && (
                              <span
                                className={`text-xs ${
                                  deadline.isOverdue
                                    ? "text-red-500 font-medium"
                                    : "text-gray-400"
                                }`}
                              >
                                {deadline.isOverdue
                                  ? " Overdue · "
                                  : "Deadline : "}
                                {deadline.formatted}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleEdit(task)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-accent hover:bg-accent/10 transition-colors"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(task)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg shadow-lg w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-logo dark:text-white font-poppins font-semibold text-lg mb-2">
              Delete task?
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Are you sure you want to delete{" "}
              <span className="font-medium text-logo dark:text-white">
                "{deleteTarget.title}"
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm border border-border rounded-md text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}