import type { SprintConfig, SprintInfo } from "./sprint-config";

const MS_PER_DAY = 86_400_000;
const WEEKS_PER_QUARTER = 13;
const DAYS_PER_WEEK = 7;
const WORK_DAYS_PER_WEEK = 5;

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
 * Check if a UTC date falls on a weekend (Saturday=6 or Sunday=0).
 */
function isWeekendDay(date: Date): boolean {
  const dow = date.getUTCDay();
  return dow === 0 || dow === 6;
}

/**
 * Count working days (Mon-Fri) in a range of calendar days starting from a date.
 */
function countWorkingDays(segmentStartDate: Date, calendarOffset: number): number {
  let count = 0;
  for (let i = 0; i < calendarOffset; i++) {
    const d = new Date(segmentStartDate.getTime() + i * MS_PER_DAY);
    if (!isWeekendDay(d)) count++;
  }
  return count;
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
  dayCount: number; // total calendar days in this segment
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

  const daysPerQuarter = WEEKS_PER_QUARTER * DAYS_PER_WEEK; // 91 calendar days
  const workDaysPerQuarter = WEEKS_PER_QUARTER * WORK_DAYS_PER_WEEK; // 65 working days
  const segments: Segment[] = [];
  let sprintCounter = 1;
  let totalDays = 0;

  for (let q = 0; q < 4; q++) {
    const quarter = q + 1;
    const sprintsInQuarter = Math.floor(workDaysPerQuarter / config.sprintLengthDays);
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
 * Derive sprint number and day-in-sprint from a working-day offset within
 * a sprint segment.
 */
function sprintFromWorkingOffset(
  workingDayOffset: number,
  sprintLengthDays: number,
  sprintNumberStart: number,
  workDaysPerQuarter: number
): { sprintNumber: number; dayInSprint: number; totalSprintDays: number } {
  const sprintsInQuarter = Math.floor(workDaysPerQuarter / sprintLengthDays);
  const remainderWorkDays = workDaysPerQuarter - sprintsInQuarter * sprintLengthDays;
  const fullSprintWorkDays = sprintsInQuarter * sprintLengthDays;

  let sprintIndexInQuarter: number;
  let dayInSprint: number;
  let totalSprintDays: number;

  if (workingDayOffset < fullSprintWorkDays) {
    sprintIndexInQuarter = Math.floor(workingDayOffset / sprintLengthDays);
    dayInSprint = (workingDayOffset % sprintLengthDays) + 1;
    totalSprintDays =
      sprintIndexInQuarter === sprintsInQuarter - 1
        ? sprintLengthDays + remainderWorkDays
        : sprintLengthDays;
  } else {
    // In the remainder days → belongs to the last sprint
    sprintIndexInQuarter = sprintsInQuarter - 1;
    dayInSprint = sprintLengthDays + (workingDayOffset - fullSprintWorkDays) + 1;
    totalSprintDays = sprintLengthDays + remainderWorkDays;
  }

  return {
    sprintNumber: sprintNumberStart + sprintIndexInQuarter,
    dayInSprint,
    totalSprintDays,
  };
}

/**
 * Compute sprint information for a given date under the provided config.
 *
 * All date arithmetic uses UTC to avoid timezone ambiguities.
 * Sprint days count only working days (Mon-Fri). Weekends return
 * isWeekend: true with context about surrounding working days.
 */
export function getSprintInfo(date: Date, config: SprintConfig): SprintInfo {
  const scheduleYear = findScheduleYear(date, config);
  const yearStart = getYearStartDate(scheduleYear, config);
  const dayOffset = daysBetween(yearStart, date); // 0-based offset from year start

  const { segments } = buildYearSchedule(config);
  const weekend = isWeekendDay(date);
  const workDaysPerQuarter = WEEKS_PER_QUARTER * WORK_DAYS_PER_WEEK; // 65

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
          isWeekend: weekend,
        };
      }

      // Sprint segment — compute based on working days
      const segmentStartDate = new Date(yearStart.getTime() + consumed * MS_PER_DAY);
      const weekInQuarter = Math.floor(offsetInSegment / DAYS_PER_WEEK) + 1;

      if (!weekend) {
        // Weekday: count working days up to (not including) today
        const workingDayOffset = countWorkingDays(segmentStartDate, offsetInSegment);
        const result = sprintFromWorkingOffset(
          workingDayOffset,
          config.sprintLengthDays,
          segment.sprintNumberStart,
          workDaysPerQuarter
        );

        return {
          ...result,
          quarter: segment.quarter,
          weekInQuarter,
          isBufferWeek: false,
          isWeekend: false,
        };
      }

      // Weekend: find surrounding Friday and Monday context
      // Look backward for Friday (last working day)
      let fridayCalendarOffset = offsetInSegment;
      const dow = date.getUTCDay(); // 0=Sun, 6=Sat
      if (dow === 6) {
        fridayCalendarOffset = offsetInSegment - 1; // Saturday → Friday
      } else {
        fridayCalendarOffset = offsetInSegment - 2; // Sunday → Friday
      }

      // Look forward for Monday (next working day)
      let mondayCalendarOffset: number;
      if (dow === 6) {
        mondayCalendarOffset = offsetInSegment + 2; // Saturday → Monday
      } else {
        mondayCalendarOffset = offsetInSegment + 1; // Sunday → Monday
      }

      // Friday's working day info
      const fridayWorkDayOffset = fridayCalendarOffset >= 0
        ? countWorkingDays(segmentStartDate, fridayCalendarOffset)
        : -1; // before segment start

      // Monday's working day info — may spill into next segment (buffer or next quarter)
      const mondayInSegment = mondayCalendarOffset < segment.dayCount;

      let lastWorkDay: number;
      let lastSprintNumber: number;
      let nextWorkDay: number;
      let nextSprintNumber: number;

      if (fridayCalendarOffset >= 0) {
        const fridayResult = sprintFromWorkingOffset(
          fridayWorkDayOffset,
          config.sprintLengthDays,
          segment.sprintNumberStart,
          workDaysPerQuarter
        );
        lastWorkDay = fridayResult.dayInSprint;
        lastSprintNumber = fridayResult.sprintNumber;
      } else {
        // Friday was before this segment — edge case at segment boundary
        lastWorkDay = 0;
        lastSprintNumber = 0;
      }

      if (mondayInSegment) {
        const mondayWorkDayOffset = countWorkingDays(segmentStartDate, mondayCalendarOffset);
        const mondayResult = sprintFromWorkingOffset(
          mondayWorkDayOffset,
          config.sprintLengthDays,
          segment.sprintNumberStart,
          workDaysPerQuarter
        );
        nextWorkDay = mondayResult.dayInSprint;
        nextSprintNumber = mondayResult.sprintNumber;
      } else {
        // Monday spills into next segment (buffer or next quarter)
        nextWorkDay = 0;
        nextSprintNumber = 0;
      }

      return {
        sprintNumber: lastSprintNumber,
        dayInSprint: 0,
        totalSprintDays: 0,
        quarter: segment.quarter,
        weekInQuarter,
        isBufferWeek: false,
        isWeekend: true,
        weekendContext: {
          lastWorkDay,
          nextWorkDay,
          lastSprintNumber,
          nextSprintNumber,
        },
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
