/**
 * Configuration for sprint cycle calculation.
 */
export interface SprintConfig {
  /** ISO date string (YYYY-MM-DD) for the first day of the first sprint. */
  startDate: string;
  /** Number of working days (Mon-Fri) per sprint (e.g. 10 for two-week sprints). */
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
  /** 1-based working day within the current sprint (0 on weekends/buffer). */
  dayInSprint: number;
  /** Total working days in the current sprint. */
  totalSprintDays: number;
  /** Quarter number (1–4). */
  quarter: number;
  /** 1-based week number within the current quarter. */
  weekInQuarter: number;
  /** Whether the date falls in a buffer/planning week. */
  isBufferWeek: boolean;
  /** Human-readable label when in a buffer week (e.g. "Planning Week"). */
  bufferLabel?: string;
  /** Whether the date falls on a weekend (Saturday or Sunday). */
  isWeekend: boolean;
  /** Present only when isWeekend is true — context about surrounding working days. */
  weekendContext?: {
    /** Working day number of the previous Friday. */
    lastWorkDay: number;
    /** Working day number of the next Monday. */
    nextWorkDay: number;
    /** Sprint number of the previous Friday. */
    lastSprintNumber: number;
    /** Sprint number of the next Monday. */
    nextSprintNumber: number;
  };
}

/**
 * Default configuration: 2-week sprints (10 working days) starting
 * Wednesday 7 Jan 2026, with 1 buffer week between quarters.
 */
export const DEFAULT_CONFIG: SprintConfig = {
  startDate: "2026-01-07",
  sprintLengthDays: 10,
  bufferWeeks: {
    afterQ1: 1,
    afterQ2: 1,
    afterQ3: 1,
    afterQ4: 1,
  },
};
