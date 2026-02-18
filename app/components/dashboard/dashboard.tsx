"use client"

import React from "react"
import "./dashboard.css"

function StatCard({ title, value, delta }: { title: string; value: string; delta?: string }) {
  return (
    <div className="rounded-lg bg-white/80 dark:bg-gray-900/60 p-4 shadow">
      <div className="text-sm text-gray-600 dark:text-gray-300">{title}</div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      <div className={`mt-1 text-sm ${delta?.startsWith("+") ? "text-green-600" : "text-red-500"}`}>
        {delta}
      </div>
    </div>
  )
}

function ReadinessScore({ percent = 0, size = 120, strokeWidth = 12 }: { percent?: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#10B981"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="mt-3 text-2xl font-bold">{percent}%</div>
    </div>
  )
}

function SmallRing({ percent = 0, size = 68, stroke = 6, label = '' }: { percent?: number; size?: number; stroke?: number; label?: string }) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference
  return (
    <div className="flex flex-col items-center w-20">
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="#10B981" strokeWidth={stroke} strokeLinecap="round" fill="none" strokeDasharray={circumference} strokeDashoffset={offset} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">{label}</div>
      </div>
      <div className="mt-2 text-sm font-medium">{percent}%</div>
    </div>
  )
}

export default function Dashboard() {
  const collections = [
    { title: 'Frontend', color: 'bg-emerald-600' },
    { title: 'Backend', color: 'bg-sky-600' },
    { title: 'Database', color: 'bg-violet-600' },
    { title: 'DevOps', color: 'bg-orange-500' },
    { title: 'Security', color: 'bg-rose-600' },
    { title: 'Data Science', color: 'bg-green-700' },
    { title: 'System Programming', color: 'bg-slate-700' },
    { title: 'Algorithms', color: 'bg-indigo-600' },
    { title: 'Machine Learning', color: 'bg-pink-600' },
    { title: 'Cloud', color: 'bg-cyan-600' },
    { title: 'Mobile', color: 'bg-yellow-600' },
    { title: 'UX/UI', color: 'bg-rose-400' },
  ]

  // sample per-collection progress (same length as collections)
  const progress = [72, 30, 55, 20, 90, 45, 60, 12, 78, 34, 56, 18]

  function abbreviate(title: string) {
    const map: Record<string, string> = {
      Frontend: 'FE',
      Backend: 'BE',
      Database: 'DB',
      DevOps: 'DO',
      Security: 'SEC',
      'Data Science': 'DS',
      'System Programming': 'SP',
      Algorithms: 'AL',
      'Machine Learning': 'ML',
      Cloud: 'CL',
      Mobile: 'MB',
      'UX/UI': 'UX',
    }
    return map[title] ?? title.split(/\W+/).map(w => w[0]).slice(0,2).join('').toUpperCase()
  }

  return (
    <div className="p-6 v-scrollbar-hide">

      {/* Recommended Collections: horizontally scrollable cards */}
      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">Recommended collections</h2>
        <div className="-mx-2">
          <div className="flex gap-4 overflow-x-auto px-2 py-2 scrollbar-hide">
            {collections.map((c) => (
              <div key={c.title} className={`min-w-[220px] flex-shrink-0 rounded-lg p-4 text-white ${c.color} shadow-lg`}>
                <div className="text-sm opacity-90">Collection</div>
                <div className="mt-2 text-xl font-bold">{c.title}</div>
                <div className="mt-3 text-xs opacity-90">5 courses · 24 items</div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* New 2-column layout below recommended collections (left column smaller) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 rounded-lg p-6 bg-white/80 dark:bg-gray-900/60 flex flex-col items-center">
          <h3 className="mb-4 text-lg font-semibold">Readiness Score</h3>

          {/* small circular progress badges, scrollable */}
          <div className="w-full">
            <div className="-mx-2">
              <div className="flex gap-4 overflow-x-auto px-2 py-2 scrollbar-hide items-end">
                {collections.map((c, i) => (
                  <div key={c.title} className="flex-shrink-0 flex flex-col items-center">
                    <SmallRing percent={progress[i] ?? 0} label={abbreviate(c.title)} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 w-full grid grid-cols-1 gap-4">
            <div>
              <h4 className="text-sm font-semibold mb-2">This week's</h4>
              <div className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                <div>Total: XP points - 1250</div>
                <div>Badges Earned:</div>
                <div>Current levels:</div>
                <div>Leaderboard Rank:</div>
              </div>
            </div>

            <div className="w-full">
              <div className="rounded-lg border border-gray-300 dark:border-gray-700 p-4 bg-transparent">
                <h4 className="text-center font-semibold mb-2">Feedback</h4>
                <div className="text-sm leading-relaxed whitespace-pre-line text-gray-700 dark:text-gray-300">
Bro you suck at frontend dont you
even dare to hop on next.js before
knowing basic css

And have you seen your score in
verbal aptitude? Man oh man english
ain't a second language to you but a
language from a second planet.
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="lg:col-span-2 rounded-lg p-6 bg-white/80 dark:bg-gray-900/60">
          {/* right column: contest card, quick action, and graph */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-6">
              <div className="rounded-lg p-4 bg-white/90 dark:bg-gray-800/70 shadow w-56 border text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300">Slaying September Contest</div>
                <div className="mt-4">
                  <button className="px-4 py-2 rounded-md border bg-gray-100 dark:bg-gray-900/40">Continue</button>
                </div>
              </div>

              <div className="flex items-center">
                <button className="rounded-full border px-4 py-2 bg-transparent">Check your interviews</button>
              </div>
            </div>

            <div className="rounded-lg border p-4 h-96 bg-transparent relative overflow-hidden">
              <div className="mx-auto w-full max-w-3xl h-full">
                <div className="flex flex-col gap-3 mb-4">
                  <select className="rounded-md border px-3 py-1 bg-transparent text-sm text-gray-800 dark:text-gray-200 dashboard-select">
                    <option>Monthly</option>
                    <option>Weekly</option>
                    <option>Daily</option>
                  </select>
                  <select className="rounded-md border px-3 py-1 bg-transparent text-sm text-gray-800 dark:text-gray-200 dashboard-select">
                    <option>subject</option>
                    <option>Frontend</option>
                    <option>Backend</option>
                  </select>
                </div>

                <div className="relative h-[calc(100%-56px)]">
                  <svg viewBox="0 0 600 300" preserveAspectRatio="none" className="w-full h-full">
                    <defs>
                      <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#297356" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#297356" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    <path d="M0 200 L50 160 L100 180 L150 120 L200 140 L250 100 L300 120 L350 90 L400 130 L450 80 L500 100 L550 60 L600 40" fill="url(#g1)" stroke="none" />
                    <path d="M0 200 L50 160 L100 180 L150 120 L200 140 L250 100 L300 120 L350 90 L400 130 L450 80 L500 100 L550 60 L600 40" fill="none" stroke="#297356" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}