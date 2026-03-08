import type { SprintConfig, SprintInfo } from "./sprint-config";

const MS_PER_DAY = 86_400_000;
const WEEKS_PER_QUARTER = 13;
const DAYS_PER_WEEK = 7;

/**
 * Parse an ISO date string (YYYY-MM-DD) as a UTC midnight Date.
 */
function parseUTCDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/**
 * Count whole calendar days between two UTC-midnight dates (end − start).
 */
function daysBetween(start: Date, end: Date): number {
  return Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY);
}

/**
 * Build the schedule for a single year starting at `yearStart`.
 *
 * Returns an array of segments in chronological order.
 * Each segment is either a block of sprints (for one quarter) or a buffer block.
 */
interface SprintSegment {
  kind: "sprint";
  quarter: number;
  sprintNumberStart: number; // 1-based, within the year
  sprintCount: number;
  dayCount: number; // total days in this segment
}

interface BufferSegment {
  kind: "buffer";
  quarter: number; // the quarter this buffer follows
  dayCount: number;
  label: string;
}

type Segment = SprintSegment | BufferSegment;

function buildYearSchedule(config: SprintConfig): {
  segments: Segment[];
  totalDays: number;
} {
  const quarterBuffers = [
    config.bufferWeeks.afterQ1,
    config.bufferWeeks.afterQ2,
    config.bufferWeeks.afterQ3,
    config.bufferWeeks.afterQ4,
  ];

  const daysPerQuarter = WEEKS_PER_QUARTER * DAYS_PER_WEEK; // 91 days
  const segments: Segment[] = [];
  let sprintCounter = 1;
  let totalDays = 0;

  for (let q = 0; q < 4; q++) {
    const quarter = q + 1;
    const sprintsInQuarter = Math.floor(daysPerQuarter / config.sprintLengthDays);
    segments.push({
      kind: "sprint",
      quarter,
      sprintNumberStart: sprintCounter,
      sprintCount: sprintsInQuarter,
      dayCount: daysPerQuarter,
    });

    sprintCounter += sprintsInQuarter;
    totalDays += daysPerQuarter;

    // Buffer weeks after this quarter
    const bufferDays = quarterBuffers[q] * DAYS_PER_WEEK;
    if (bufferDays > 0) {
      segments.push({
        kind: "buffer",
        quarter,
        dayCount: bufferDays,
        label: `Planning Week (after Q${quarter})`,
      });
      totalDays += bufferDays;
    }
  }

  return { segments, totalDays };
}

/**
 * Compute the year-start date for a given target year, based on the config's
 * startDate. For multi-year support, each subsequent year starts the day after
 * the previous year's schedule ends.
 */
function getYearStartDate(
  targetYear: number,
  config: SprintConfig
): Date {
  const configStart = parseUTCDate(config.startDate);
  const configYear = configStart.getUTCFullYear();

  if (targetYear === configYear) {
    return configStart;
  }

  const { totalDays } = buildYearSchedule(config);
  let current = configStart;

  if (targetYear > configYear) {
    for (let y = configYear; y < targetYear; y++) {
      current = new Date(current.getTime() + totalDays * MS_PER_DAY);
    }
  } else {
    for (let y = configYear; y > targetYear; y--) {
      current = new Date(current.getTime() - totalDays * MS_PER_DAY);
    }
  }

  return current;
}

/**
 * Determine which year-schedule a given date falls into.
 * Returns the year number (matching config startDate convention).
 */
function findScheduleYear(date: Date, config: SprintConfig): number {
  const configStart = parseUTCDate(config.startDate);
  const configYear = configStart.getUTCFullYear();
  const { totalDays } = buildYearSchedule(config);

  if (date >= configStart) {
    let yearStart = configStart;
    let year = configYear;
    while (true) {
      const yearEnd = new Date(yearStart.getTime() + totalDays * MS_PER_DAY);
      if (date < yearEnd) return year;
      yearStart = yearEnd;
      year++;
    }
  } else {
    let year = configYear;
    let yearStart = configStart;
    while (true) {
      const prevYearStart = new Date(yearStart.getTime() - totalDays * MS_PER_DAY);
      year--;
      if (date >= prevYearStart) return year;
      yearStart = prevYearStart;
    }
  }
}

/**
 * Compute sprint information for a given date under the provided config.
 *
 * All date arithmetic uses UTC to avoid timezone ambiguities.
 */
export function getSprintInfo(date: Date, config: SprintConfig): SprintInfo {
  const scheduleYear = findScheduleYear(date, config);
  const yearStart = getYearStartDate(scheduleYear, config);
  const dayOffset = daysBetween(yearStart, date); // 0-based offset from year start

  const { segments } = buildYearSchedule(config);

  let consumed = 0;

  for (const segment of segments) {
    if (dayOffset < consumed + segment.dayCount) {
      const offsetInSegment = dayOffset - consumed;

      if (segment.kind === "buffer") {
        const weekInQuarter =
          WEEKS_PER_QUARTER + 1 + Math.floor(offsetInSegment / DAYS_PER_WEEK);
        return {
          sprintNumber: 0,
          dayInSprint: 0,
          totalSprintDays: 0,
          quarter: segment.quarter,
          weekInQuarter,
          isBufferWeek: true,
          bufferLabel: segment.label,
        };
      }

      // Sprint segment — figure out which sprint and day
      const daysPerQuarter = WEEKS_PER_QUARTER * DAYS_PER_WEEK;
      const sprintsInQuarter = Math.floor(daysPerQuarter / config.sprintLengthDays);
      const fullSprintDays = sprintsInQuarter * config.sprintLengthDays;
      const remainderDays = daysPerQuarter - fullSprintDays;

      // Determine sprint index within this quarter
      let sprintIndexInQuarter: number;
      let dayInSprint: number;
      let totalSprintDays: number;

      if (offsetInSegment < fullSprintDays) {
        sprintIndexInQuarter = Math.floor(offsetInSegment / config.sprintLengthDays);
        dayInSprint = (offsetInSegment % config.sprintLengthDays) + 1;
        totalSprintDays =
          sprintIndexInQuarter === sprintsInQuarter - 1
            ? config.sprintLengthDays + remainderDays
            : config.sprintLengthDays;
      } else {
        // We're in the remainder days → belongs to the last sprint
        sprintIndexInQuarter = sprintsInQuarter - 1;
        dayInSprint =
          config.sprintLengthDays + (offsetInSegment - fullSprintDays) + 1;
        totalSprintDays = config.sprintLengthDays + remainderDays;
      }

      const sprintNumber = segment.sprintNumberStart + sprintIndexInQuarter;
      const weekInQuarter = Math.floor(offsetInSegment / DAYS_PER_WEEK) + 1;

      return {
        sprintNumber,
        dayInSprint,
        totalSprintDays,
        quarter: segment.quarter,
        weekInQuarter,
        isBufferWeek: false,
      };
    }

    consumed += segment.dayCount;
  }

  // Should never reach here if findScheduleYear works correctly,
  // but fallback just in case.
  throw new Error(
    `Date ${date.toISOString()} is outside the computed schedule range.`
  );
}
