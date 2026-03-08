"use client";

import { useState } from "react";
import type { SprintConfig } from "@/lib/sprint-config";
import { DEFAULT_CONFIG } from "@/lib/sprint-config";

const SPRINT_LENGTH_OPTIONS = [
  { label: "1 week (5 days)", value: 5 },
  { label: "2 weeks (10 days)", value: 10 },
  { label: "3 weeks (15 days)", value: 15 },
  { label: "4 weeks (20 days)", value: 20 },
];

const BUFFER_OPTIONS = [0, 1, 2];

const QUARTER_LABELS = ["Q1", "Q2", "Q3", "Q4"] as const;
const BUFFER_KEYS = ["afterQ1", "afterQ2", "afterQ3", "afterQ4"] as const;

export default function SettingsPanel({
  config,
  onChange,
}: {
  config: SprintConfig;
  onChange: (config: SprintConfig) => void;
}) {
  const [open, setOpen] = useState(false);

  const updateSprintLength = (value: number) => {
    onChange({ ...config, sprintLengthDays: value });
  };

  const updateStartDate = (value: string) => {
    onChange({ ...config, startDate: value });
  };

  const updateBuffer = (
    key: (typeof BUFFER_KEYS)[number],
    value: number
  ) => {
    onChange({
      ...config,
      bufferWeeks: { ...config.bufferWeeks, [key]: value },
    });
  };

  const handleReset = () => {
    onChange({ ...DEFAULT_CONFIG });
  };

  return (
    <>
      {/* Gear toggle button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close settings" : "Open settings"}
        className="fixed top-4 right-4 z-50 p-2 rounded-lg bg-surface border border-border text-text-muted hover:text-text hover:border-accent-dim transition-colors cursor-pointer"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
        </svg>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-out panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-80 bg-bg-subtle border-l border-border transform transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-semibold text-text">Settings</h2>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close settings"
              className="p-1 text-text-muted hover:text-text transition-colors cursor-pointer"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Sprint Length */}
          <fieldset className="mb-6">
            <legend className="text-xs font-mono text-text-muted uppercase tracking-wide mb-2">
              Sprint Length
            </legend>
            <div className="flex flex-col gap-1.5">
              {SPRINT_LENGTH_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 cursor-pointer text-sm text-text"
                >
                  <input
                    type="radio"
                    name="sprintLength"
                    value={opt.value}
                    checked={config.sprintLengthDays === opt.value}
                    onChange={() => updateSprintLength(opt.value)}
                    className="accent-accent"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Year Start Date */}
          <fieldset className="mb-6">
            <legend className="text-xs font-mono text-text-muted uppercase tracking-wide mb-2">
              Year Start Date
            </legend>
            <input
              type="date"
              value={config.startDate}
              onChange={(e) => updateStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-surface border border-border text-text text-sm focus:outline-none focus:border-accent-dim"
            />
          </fieldset>

          {/* Buffer Weeks */}
          <fieldset className="mb-6">
            <legend className="text-xs font-mono text-text-muted uppercase tracking-wide mb-2">
              Buffer Weeks
            </legend>
            <div className="flex flex-col gap-3">
              {QUARTER_LABELS.map((label, i) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-text">After {label}</span>
                  <select
                    value={config.bufferWeeks[BUFFER_KEYS[i]]}
                    onChange={(e) =>
                      updateBuffer(BUFFER_KEYS[i], Number(e.target.value))
                    }
                    className="px-2 py-1 rounded-md bg-surface border border-border text-text text-sm focus:outline-none focus:border-accent-dim"
                  >
                    {BUFFER_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "week" : "weeks"}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </fieldset>

          {/* Timezone */}
          <fieldset className="mb-8">
            <legend className="text-xs font-mono text-text-muted uppercase tracking-wide mb-2">
              Timezone
            </legend>
            <p className="text-xs text-text-muted">
              All calculations use UTC. Timezone support coming soon.
            </p>
          </fieldset>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="mt-auto py-2 px-4 rounded-md border border-border text-sm text-text-muted hover:text-text hover:border-accent-dim transition-colors cursor-pointer"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </>
  );
}
