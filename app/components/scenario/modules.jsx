"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import "./modules.css";

export default function Modules({ onSelect, selectedModule }) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchModules() {
      if (!supabase) {
        console.warn("Supabase client not configured");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("modules")
          .select("*")
          .order("id", { ascending: true });

        if (error) {
          console.error("Error fetching modules:", error);
        } else if (data) {
          setModules(data);
        }
      } catch (err) {
        console.error("Failed to connect to Supabase:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchModules();
  }, []);

  const completeCount = modules.filter((m) => m.completed === m.lessons).length;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-white">Modules</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Track your learning path
          </p>
        </div>
        {!loading && modules.length > 0 && (
          <span className="text-xs text-gray-500">
            {completeCount}/{modules.length} complete
          </span>
        )}
      </div>

      <div className="modules-scroll flex flex-col gap-2.5 overflow-y-auto flex-1 pr-1">
        {loading ? (
          <p className="text-xs text-gray-500 text-center mt-4">
            Loading modules...
          </p>
        ) : modules.length === 0 ? (
          <p className="text-xs text-gray-500 text-center mt-4">
            No modules found.
          </p>
        ) : (
          modules.map((mod) => {
            const progress =
              mod.lessons > 0
                ? Math.round((mod.completed / mod.lessons) * 100)
                : 0;
            const isComplete = mod.completed === mod.lessons;

            return (
              <button
                key={mod.id}
                onClick={() => onSelect?.(mod)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 ${
                  selectedModule?.id === mod.id
                    ? "bg-white/8 border-white/20"
                    : "bg-white/3 border-white/8 hover:bg-white/6 hover:border-white/15"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  {mod.icon && (
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-base">
                      {mod.icon}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {mod.title}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {mod.completed}/{mod.lessons} lessons
                    </p>
                  </div>
                  {mod.tag && (
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                        isComplete
                          ? "text-white/80 bg-white/10 border-white/20"
                          : "text-gray-500 bg-white/4 border-white/8"
                      }`}
                    >
                      {mod.tag}
                    </span>
                  )}
                </div>

                <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                  <div
                    className="h-1 rounded-full bg-white/40 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] text-gray-600">Progress</span>
                  <span
                    className={`text-[10px] font-medium ${isComplete ? "text-white/70" : "text-gray-500"}`}
                  >
                    {progress}%
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
