"use client";

import { useState } from "react";
import Scenarios from "../../components/scenario/scenarios";
import Content from "../../components/scenario/content";

export default function ScenarioPracticePage() {
  const [selectedScenario, setSelectedScenario] = useState(null);

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden bg-[#0c0c0c] p-5">
      <div className="grid grid-cols-[1fr_420px] gap-4 h-full">
        {/* Center — Content */}
        <div className="bg-[#141414] border border-white/8 rounded-2xl p-5 overflow-hidden flex flex-col">
          <Content selectedScenario={selectedScenario} />
        </div>

        {/* Right — Scenarios */}
        <div className="bg-[#141414] border border-white/8 rounded-2xl p-5 overflow-hidden flex flex-col">
          <Scenarios
            onSelect={setSelectedScenario}
            selected={selectedScenario}
          />
        </div>
      </div>
    </div>
  );
}
