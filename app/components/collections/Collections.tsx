"use client";

import React, { useState } from "react";
import Link from "next/link";
import MockPanel from "./MockPanel";

const sections = [
  {
    title: "Domains",
    items: ["Frontend", "Backend", "Data Science"],
  },
  {
    title: "Database",
    items: ["MongoDB", "SQL"],
  },
  {
    title: "DSA",
    items: ["Data Structure", "Analysis Of Algorithm", "Time Complexity"],
  },
  {
    title: "Extras",
    items: ["Operating System", "Computer Network"],
  },
];

function SmallCollectionCard({ title, onMock }: { title: string; onMock: (t: string) => void }) {
  const desc = `${title} Description`;
  const slug = title.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="group shrink-0 rounded-lg p-8 min-w-[24rem] sm:min-w-104 text-white bg-transparent recommended-card card-outline relative overflow-hidden" style={{minHeight: 180}}>
      {/* Visible center content */}
      <div className="flex items-center justify-center h-full">
        <div className="text-lg sm:text-xl font-semibold opacity-100 group-hover:opacity-0 transition-opacity duration-200">{title}</div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-4 px-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="text-xl font-semibold">{title}</div>
        <div className="text-sm opacity-80 text-center">{desc}</div>
        <div className="flex gap-3 mt-2">
          <Link href={`/collections/${slug}`} className="px-4 py-2 rounded-md border border-white/30 bg-white/6 hover:bg-white/10">Learn</Link>
          <button onClick={() => onMock(title)} className="px-4 py-2 rounded-md border border-white/30 bg-white/6 hover:bg-white/10">Mock</button>
        </div>
      </div>
    </div>
  );
}

// MockPanel is provided by app/components/collections/MockPanel.tsx (extracted)

export default function Collections({ className = "" }: { className?: string }) {
  const [mockTopic, setMockTopic] = useState<string | null>(null);

  return (
    <section className={className}>
      <h1 className="mb-6 text-3xl font-semibold">Collections</h1>

      <div className="space-y-6">
        {sections.map((s) => (
          <div key={s.title}>
            <h2 className="mb-3 text-lg font-semibold">{s.title}</h2>

            <div className="rounded-2xl overflow-hidden">
              <div className="flex gap-4 overflow-x-auto pl-0 pr-2 py-2 scrollbar-hide">
                {s.items.map((it) => (
                  <SmallCollectionCard key={it} title={it} onMock={(t) => setMockTopic(t)} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {mockTopic && <MockPanel topic={mockTopic} onClose={() => setMockTopic(null)} />}
    </section>
  );
}
