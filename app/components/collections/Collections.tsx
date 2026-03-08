"use client";

import React, { useState } from "react";
import Link from "next/link";
import MockPanel from "./MockPanel";
import MockInterviewPanel from "../mock_int/mock_int";

import { supabase } from "../../../lib/supabaseClient";

type CollectionRow = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  section?: string | null;
  order?: number | null;
};


function SmallCollectionCard({ title, onMock }: { title: string; onMock: (t: string) => void }) {
  const desc = `${title} Description`;
  const slug = title.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="group shrink-0 rounded-lg p-8 min-w-[24rem] sm:min-w-104 text-white bg-transparent recommended-card card-outline relative overflow-hidden" style={{minHeight: 180}}>
      {/* Visible center content */}
      <div className="flex items-center justify-center h-full z-10">
        <div className="text-lg sm:text-xl font-semibold opacity-100 group-hover:opacity-0 transition-opacity duration-200">{title}</div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-4 px-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-0 group-hover:z-20">
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
  const [mockDifficulty, setMockDifficulty] = useState<string | null>(null);
  const [sections, setSections] = useState<Array<{ title: string; items: string[] }>>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      // avoid specifying incorrect generics for supabase.from() in this JS-configured client
      const res = await supabase.from('collections').select('*').order('section', { ascending: true }).order('order', { ascending: true });
      const data = res.data as CollectionRow[] | null;
      const error = res.error;
      if (error) {
        console.error('Error loading collections', error);
        setLoading(false);
        return;
      }

      const grouped: Record<string, string[]> = {};
      (data || []).forEach((r) => {
        const section = r.section || 'General';
        if (!grouped[section]) grouped[section] = [];
        grouped[section].push(r.title);
      });

      const mapped = Object.keys(grouped).map((k) => ({ title: k, items: grouped[k] }));
      if (mounted) {
        setSections(mapped);
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);
  const [interviewTopic, setInterviewTopic] = useState<string | null>(null);

  return (
    <section className={className}>
      <h1 className="mb-6 text-3xl font-semibold">Collections</h1>

      <div className="space-y-6">
        {loading ? (
          <div className="opacity-60">Loading collections…</div>
        ) : (
          sections.map((s) => (
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
          ))
        )}
      </div>

      {mockTopic && (
        <MockPanel
          topic={mockTopic}
          onClose={() => setMockTopic(null)}
          onStart={(difficulty: string) => {
            console.log("Mock start requested:", difficulty);
            // Keep the chosen topic so we can pass it into the interview panel
            setInterviewTopic(mockTopic);
            setMockTopic(null);
            setMockDifficulty(difficulty);
          }}
        />
      )}

      {mockDifficulty && (
        <MockInterviewPanel
          difficulty={mockDifficulty}
          topic={interviewTopic || undefined}
          onClose={() => {
            setMockDifficulty(null);
            setInterviewTopic(null);
          }}
        />
      )}
    </section>
  );
}
