"use client";
import { useState, useMemo, useEffect } from "react";
import "./scenarios.css";

const scenarios = [
  {
    id: 1,
    title: "Time & Priority Management",
    description:
      "Handle competing deadlines and manage workload under pressure",
    difficulty: "Easy",
    progress: 0,
  },
  {
    id: 2,
    title: "Team Collaboration",
    description: "Navigate cross-functional teamwork and resolve conflicts",
    difficulty: "Easy",
    progress: 30,
  },
  {
    id: 3,
    title: "Behavioral HR Round Practice",
    description: "STAR method responses for common HR behavioral questions",
    difficulty: "Easy",
    progress: 60,
  },
  {
    id: 4,
    title: "Performance Feedback",
    description: "Give and receive constructive performance feedback",
    difficulty: "Easy",
    progress: 100,
  },
  {
    id: 5,
    title: "Leadership Scenarios",
    description:
      "Lead teams through ambiguity, conflict, and high-stakes decisions",
    difficulty: "Medium",
    progress: 20,
  },
  {
    id: 6,
    title: "Ethical Decision Making",
    description: "Navigate workplace dilemmas with integrity and clarity",
    difficulty: "Medium",
    progress: 45,
  },
  {
    id: 7,
    title: "Tough Interview Moments",
    description:
      "Handle curveball questions and uncomfortable interview scenarios",
    difficulty: "Medium",
    progress: 10,
  },
  {
    id: 8,
    title: "Group Discussion Panel Handling",
    description: "Contribute, moderate, and stand out in panel discussions",
    difficulty: "Medium",
    progress: 0,
  },
  {
    id: 9,
    title: "Project Deep Dive",
    description: "Walk through past projects with clarity, impact, and depth",
    difficulty: "Medium",
    progress: 75,
  },
  {
    id: 10,
    title: "Technical Round Pressure",
    description:
      "Solve complex technical problems under timed interview conditions",
    difficulty: "Hard",
    progress: 0,
  },
  {
    id: 11,
    title: "Salary Offer Discussions",
    description:
      "Negotiate compensation confidently without leaving money on the table",
    difficulty: "Hard",
    progress: 15,
  },
  {
    id: 12,
    title: "Crisis Management",
    description:
      "Respond decisively and communicate clearly in high-pressure crises",
    difficulty: "Hard",
    progress: 0,
  },
  {
    id: 13,
    title: "Advanced Pressure Scenarios",
    description:
      "Face the most intense real-world interview and workplace challenges",
    difficulty: "Hard",
    progress: 5,
  },
];

const difficultyColors = {
  Easy: "text-sky-400 bg-sky-400/10 border-sky-500/20",
  Medium: "text-amber-400 bg-amber-400/10 border-amber-500/20",
  Hard: "text-rose-400 bg-rose-400/10 border-rose-500/20",
};

const filterColors = {
  Easy: "text-sky-400 border-sky-500/30 bg-sky-400/10",
  Medium: "text-amber-400 border-amber-500/30 bg-amber-400/10",
  Hard: "text-rose-400 border-rose-500/30 bg-rose-400/10",
};

export default function Scenarios({ onSelect, selected }) {
  const [diffFilter, setDiffFilter] = useState(null);
  const [completedOnly, setCompletedOnly] = useState(false);

  const ordered = useMemo(() => {
    const withProgress = scenarios
      .filter((s) => s.progress > 0)
      .sort((a, b) => b.progress - a.progress);
    const noProgress = scenarios.filter((s) => s.progress === 0);
    return [...withProgress, ...noProgress];
  }, []);

  const [shuffled, setShuffled] = useState(ordered);

  useEffect(() => {
    const withProgress = scenarios
      .filter((s) => s.progress > 0)
      .sort((a, b) => b.progress - a.progress);
    const noProgress = [...scenarios.filter((s) => s.progress === 0)].sort(
      () => Math.random() - 0.5,
    );
    setShuffled([...withProgress, ...noProgress]);
  }, []);
  const visible = shuffled
    .filter((s) => !diffFilter || s.difficulty === diffFilter)
    .filter((s) => !completedOnly || s.progress === 100);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-white">Scenarios</h2>
        <div className="flex items-center gap-1">
          {["Easy", "Medium", "Hard"].map((d) => (
            <button
              key={d}
              onClick={() => setDiffFilter(diffFilter === d ? null : d)}
              className={`text-[10px] font-medium px-2.5 py-1 rounded-full border transition-all duration-200 ${
                diffFilter === d
                  ? filterColors[d]
                  : "text-gray-500 border-white/10 hover:border-white/20 hover:text-gray-300"
              }`}
            >
              {d}
            </button>
          ))}
          <button
            onClick={() => setCompletedOnly(!completedOnly)}
            className={`text-[10px] font-medium px-2.5 py-1 rounded-full border transition-all duration-200 ${
              completedOnly
                ? "text-emerald-400 border-emerald-500/30 bg-emerald-400/10"
                : "text-gray-500 border-white/10 hover:border-white/20 hover:text-gray-300"
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="scenarios-scroll flex flex-col gap-2 overflow-y-auto flex-1 pr-1">
        {visible.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => onSelect?.(scenario)}
            className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 ${
              selected?.id === scenario.id
                ? "bg-white/8 border-white/20"
                : "bg-white/3 border-white/8 hover:bg-white/6 hover:border-emerald-500/30"
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <p className="text-sm font-medium text-white truncate flex-1">
                {scenario.title}
              </p>
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${difficultyColors[scenario.difficulty]}`}
              >
                {scenario.difficulty}
              </span>
            </div>
            <p className="text-xs text-gray-500 truncate mb-2">
              {scenario.description}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/5 rounded-full h-1 overflow-hidden">
                <div
                  className="h-1 rounded-full bg-white/30 transition-all duration-500"
                  style={{ width: `${scenario.progress}%` }}
                />
              </div>
              <span className="text-[11px] text-gray-500 shrink-0">
                {scenario.progress}% completed
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
