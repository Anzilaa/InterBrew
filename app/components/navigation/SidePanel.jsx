"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/collection", label: "Collection", icon: "📂" },
  { href: "/training", label: "Training", icon: "🎯" },
  { href: "/leaderboard", label: "Leaderboard", icon: "🏆" },
  { href: "/challenge", label: "Challenge", icon: "⚔️" },
];

export default function SidePanel() {
  const pathname = usePathname() || "/";

  return (
    <aside className="fixed left-0 top-0 h-full z-30 backdrop-blur-md bg-white/5 dark:bg-black/20">
      <div className="group flex h-full flex-col items-start">
        <div className="flex items-center h-16 w-16 group-hover:w-56 transition-all duration-200 ease-in-out px-3">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-zinc-500/40 dark:bg-zinc-600/40" aria-hidden="true" />
            <div className="sr-only">InterBrew</div>
          </div>
        </div>

        <nav className="mt-4 w-16 group-hover:w-56 transition-all duration-200">
          {items.map((it) => {
            const active = pathname.startsWith(it.href);
            return (
              <Link key={it.href} href={it.href} className={`flex items-center gap-3 px-3 h-12 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 ${active ? "bg-gray-200 dark:bg-zinc-700" : ""}`}>
                <div className="w-8 text-lg">{it.icon}</div>
                <div className="overflow-hidden whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200">
                  {it.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto w-16 group-hover:w-56 transition-all duration-200 px-3 mb-6">
          <div className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">Version 0.1</div>
        </div>
      </div>
    </aside>
  );
}
