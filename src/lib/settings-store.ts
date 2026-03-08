"use client";

import { useState, useEffect, useCallback } from "react";
import type { SprintConfig } from "./sprint-config";
import { DEFAULT_CONFIG } from "./sprint-config";

const STORAGE_KEY = "sprint-config";

function readConfig(): SprintConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw);
    // Validate structure — must have the expected keys
    if (
      typeof parsed.startDate === "string" &&
      typeof parsed.sprintLengthDays === "number" &&
      parsed.bufferWeeks &&
      typeof parsed.bufferWeeks.afterQ1 === "number" &&
      typeof parsed.bufferWeeks.afterQ2 === "number" &&
      typeof parsed.bufferWeeks.afterQ3 === "number" &&
      typeof parsed.bufferWeeks.afterQ4 === "number"
    ) {
      return parsed as SprintConfig;
    }
    return DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
}

function writeConfig(config: SprintConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // localStorage may be unavailable (private browsing, quota exceeded)
  }
}

/**
 * React hook that persists SprintConfig in localStorage.
 * Returns the current config and a setter that writes through to storage.
 * Falls back to DEFAULT_CONFIG when nothing is stored or on SSR.
 */
export function useSprintConfig(): [SprintConfig, (config: SprintConfig) => void] {
  const [config, setConfigState] = useState<SprintConfig>(DEFAULT_CONFIG);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount
  useEffect(() => {
    setConfigState(readConfig());
    setHydrated(true);
  }, []);

  const setConfig = useCallback((next: SprintConfig) => {
    setConfigState(next);
    writeConfig(next);
  }, []);

  // Before hydration, return DEFAULT_CONFIG to avoid flicker mismatches
  return [hydrated ? config : DEFAULT_CONFIG, setConfig];
}
