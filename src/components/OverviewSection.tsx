"use client";

import { useState } from "react";
import type { SprintConfig, SprintInfo } from "@/lib/sprint-config";
import QuarterTimeline from "@/components/QuarterTimeline";
import SprintCalendar from "@/components/SprintCalendar";

export default function OverviewSection({
  info,
  config,
}: {
  info: SprintInfo;
  config: SprintConfig;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full max-w-2xl flex flex-col items-center">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-xs font-mono text-text-muted hover:text-text transition-colors tracking-wide uppercase cursor-pointer"
      >
        <span>{open ? "Hide" : "Show"} Overview</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="mt-6 w-full flex flex-col items-center gap-6">
          <QuarterTimeline info={info} config={config} />
          <SprintCalendar info={info} config={config} />
        </div>
      )}
    </div>
  );
}
