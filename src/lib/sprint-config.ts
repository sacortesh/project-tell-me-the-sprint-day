/**
 * Configuration for sprint cycle calculation.
 */
export interface SprintConfig {
  /** ISO date string (YYYY-MM-DD) for the first day of the first sprint. */
  startDate: string;
  /** Number of calendar days per sprint (e.g. 14 for two-week sprints). */
  sprintLengthDays: number;
  /** Number of buffer (planning/stretch) weeks inserted after each quarter. */
  bufferWeeks: {
    afterQ1: number;
    afterQ2: number;
    afterQ3: number;
    afterQ4: number;
  };
}

/**
 * Computed sprint information for a given date.
 */
export interface SprintInfo {
  /** 1-based sprint number within the year. */
  sprintNumber: number;
  /** 1-based day within the current sprint. */
  dayInSprint: number;
  /** Total number of days in the current sprint. */
  totalSprintDays: number;
  /** Quarter number (1–4). */
  quarter: number;
  /** 1-based week number within the current quarter. */
  weekInQuarter: number;
  /** Whether the date falls in a buffer/planning week. */
  isBufferWeek: boolean;
  /** Human-readable label when in a buffer week (e.g. "Planning Week"). */
  bufferLabel?: string;
}

/**
 * Default configuration: 2-week sprints starting Monday 6 Jan 2025,
 * with zero buffer weeks between quarters.
 */
export const DEFAULT_CONFIG: SprintConfig = {
  startDate: "2025-01-06",
  sprintLengthDays: 14,
  bufferWeeks: {
    afterQ1: 0,
    afterQ2: 0,
    afterQ3: 0,
    afterQ4: 0,
  },
};
