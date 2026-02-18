"use client"

import React from "react";

export default function TopNav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between px-4 backdrop-blur-md bg-white/5 dark:bg-black/20">
      <div className="flex items-center gap-4">
        <div className="text-lg font-semibold">InterBrew</div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-transparent">
          <div className="text-sm">🔥</div>
          <div className="text-sm">10</div>
        </div>

        <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-zinc-800">❓</button>
        <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-zinc-800">✉️</button>
        <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-zinc-800">ℹ️</button>
        <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-zinc-800">👤</button>
      </div>
    </header>
  );
}
