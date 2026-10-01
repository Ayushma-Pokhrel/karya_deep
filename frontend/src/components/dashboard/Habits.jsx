import { useState, useEffect, useMemo } from "react";
import { fetchHabitPresets, createTask } from "../../api/api";
import { FaSpinner, FaSearch, FaPlus } from "react-icons/fa";
import { getHabitIcon } from "../../utils/habitIcons";

export default function Habits() {
  const [habitPresets, setHabitPresets] = useState([]);
  const [presetsLoading, setPresetsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [presetSearch, setPresetSearch] = useState("");
  const [addingHabit, setAddingHabit] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showCustomHabit, setShowCustomHabit] = useState(false);
  const [customHabitName, setCustomHabitName] = useState("");
  const [customHabitTime, setCustomHabitTime] = useState("09:00");

  useEffect(() => {
    const loadPresets = async () => {
      try {
        const data = await fetchHabitPresets();
        setHabitPresets(data);
      } catch (err) {
        console.error("Failed to load habit presets:", err);
        setError("Failed to load habit presets.");
      } finally {
        setPresetsLoading(false);
      }
    };
    loadPresets();
  }, []);

  const categories = useMemo(() => {
    const counts = {};
    habitPresets.forEach((p) => {
      const cat = p.category || "Other";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [habitPresets]);

  const filteredPresets = useMemo(() => {
    let list = habitPresets;
    if (activeCategory !== "All") {
      list = list.filter((p) => (p.category || "Other") === activeCategory);
    }
    if (presetSearch.trim()) {
      const q = presetSearch.trim().toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q));
    }
    return list;
  }, [habitPresets, activeCategory, presetSearch]);

  const handleAddHabit = async (preset) => {
    setError("");
    setSuccess("");
    setAddingHabit(preset.title);
    try {
      await createTask({
        title: preset.title,
        description: preset.description,
        priority: preset.default_priority || "Medium",
        is_habit: true,
        recurrence: preset.recurrence_type || "daily",
        recurrence_times: preset.suggested_times,
        due_date: null,
      });
      setSuccess(`"${preset.title}" added as a daily habit!`);
    } catch (err) {
      setError(err.detail || `Failed to add ${preset.title}.`);
    } finally {
      setAddingHabit(null);
    }
  };

  const handleAddCustomHabit = async (e) => {
    e.preventDefault();
    if (!customHabitName.trim()) return;
    setError("");
    setSuccess("");
    setAddingHabit(customHabitName);
    try {
      await createTask({
        title: customHabitName,
        description: "",
        priority: "Medium",
        is_habit: true,
        recurrence: "daily",
        recurrence_times: [customHabitTime],
        due_date: null,
      });
      setSuccess(`"${customHabitName}" added as a daily habit!`);
      setCustomHabitName("");
      setCustomHabitTime("09:00");
      setShowCustomHabit(false);
    } catch (err) {
      setError(err.detail || "Failed to add habit.");
    } finally {
      setAddingHabit(null);
    }
  };

  return (
    <div className="flex flex-col bg-secondary dark:bg-black min-h-full">
      {/* Topbar — matches TaskList */}
      <div className="flex justify-between items-center py-3 px-8 bg-secondary dark:bg-gray-800 shadow-md sticky top-0 z-10 shrink-0">
        <h1 className="font-medium text-xl text-logo dark:text-white font-poppins">
          Habits
        </h1>
        <div className="group relative flex items-center h-9 w-9 hover:w-72 focus-within:w-72 border border-border dark:border-gray-600 rounded-md bg-primary/10 dark:bg-gray-700 focus-within:ring-1 focus-within:ring-accent transition-all duration-300 overflow-hidden">
          <input
            type="text"
            placeholder="Search habits…"
            value={presetSearch}
            onChange={(e) => setPresetSearch(e.target.value)}
            className="w-full h-full pl-3 pr-8 bg-transparent text-sm text-logo dark:text-white outline-none placeholder:text-gray-400"
          />
          <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm shrink-0 pointer-events-none" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col gap-4">
        {error && <p className="text-red-500 text-xs">{error}</p>}
        {success && <p className="text-green-500 text-xs">{success}</p>}

        <button
          type="button"
          onClick={() => setShowCustomHabit((v) => !v)}
          className="self-start flex items-center gap-2 border border-dashed border-accent rounded-md px-3 py-2 text-xs sm:text-sm text-accent bg-transparent hover:bg-accent/10 transition-colors cursor-pointer"
        >
          <FaPlus size={12} className="shrink-0" />
          Custom habit
        </button>

        {showCustomHabit && (
          <form
            onSubmit={handleAddCustomHabit}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 border border-border dark:border-gray-700 rounded-md p-2 bg-primary/30 dark:bg-gray-800"
          >
            <input
              type="text"
              placeholder="Call Mom, Meditate, etc."
              value={customHabitName}
              onChange={(e) => setCustomHabitName(e.target.value)}
              required
              className="flex-1 min-w-0 px-3 py-1.5 text-sm outline-none bg-transparent text-logo dark:text-white placeholder:text-gray-400 border border-border rounded-md focus:ring-1 focus:ring-accent"
            />
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={customHabitTime}
                onChange={(e) => setCustomHabitTime(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-1.5 text-sm outline-none bg-transparent text-logo dark:text-white border border-border rounded-md focus:ring-1 focus:ring-accent [color-scheme:light] dark:[color-scheme:dark]"
              />
              <button
                type="submit"
                disabled={addingHabit === customHabitName}
                className="bg-accent hover:bg-accent-hover text-white px-3 py-1.5 rounded-md text-sm shrink-0 disabled:opacity-60"
              >
                Add
              </button>
            </div>
          </form>
        )}

        {!presetsLoading && categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setActiveCategory("All")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                activeCategory === "All"
                  ? "bg-accent text-white"
                  : "bg-primary/30 dark:bg-gray-800 text-logo dark:text-white hover:bg-accent/10"
              }`}
            >
              All ({habitPresets.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => setActiveCategory(cat.name)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  activeCategory === cat.name
                    ? "bg-accent text-white"
                    : "bg-primary/30 dark:bg-gray-800 text-logo dark:text-white hover:bg-accent/10"
                }`}
              >
                {cat.name} ({cat.count})
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {presetsLoading ? (
            <p className="text-gray-400 text-sm flex items-center gap-2 mt-4">
              <FaSpinner className="animate-spin" size={12} /> Loading habits...
            </p>
          ) : filteredPresets.length === 0 ? (
            <p className="text-gray-400 text-sm text-center w-full mt-10">
              {presetSearch
                ? "No habits match your search."
                : "No presets available."}
            </p>
          ) : (
            filteredPresets.map((preset) => {
              const Icon = getHabitIcon(preset.category);
              const isLoading = addingHabit === preset.title;
              return (
                <button
                  key={preset.id || preset.title}
                  type="button"
                  onClick={() => handleAddHabit(preset)}
                  disabled={isLoading}
                  className="flex items-center gap-2 border border-border dark:border-gray-700 rounded-md px-3 py-2 text-xs sm:text-sm text-logo dark:text-white bg-primary/30 dark:bg-gray-800 hover:bg-accent/10 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  {isLoading ? (
                    <FaSpinner
                      className="animate-spin text-accent shrink-0"
                      size={14}
                    />
                  ) : (
                    <Icon className="text-accent shrink-0" size={14} />
                  )}
                  <span className="truncate max-w-[160px] sm:max-w-none">
                    {preset.title}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}