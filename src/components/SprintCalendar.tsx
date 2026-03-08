import type { SprintConfig, SprintInfo } from "@/lib/sprint-config";

const WEEKS_PER_QUARTER = 13;
const DAYS_PER_WEEK = 7;
const WORK_DAYS_PER_WEEK = 5;
const MS_PER_DAY = 86_400_000;

function parseUTCDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function isWeekendDay(date: Date): boolean {
  const dow = date.getUTCDay();
  return dow === 0 || dow === 6;
}

interface SprintBlock {
  sprintNumber: number;
  workingDays: number;
  startDate: Date;
  endDate: Date;
}

/**
 * Compute the sprint blocks for a given quarter.
 * Returns an array of sprints with their number, working day count, and date range.
 */
function getQuarterSprints(
  quarter: number,
  config: SprintConfig
): SprintBlock[] {
  const configStart = parseUTCDate(config.startDate);
  const quarterCalDays = WEEKS_PER_QUARTER * DAYS_PER_WEEK; // 91
  const workDaysPerQuarter = WEEKS_PER_QUARTER * WORK_DAYS_PER_WEEK; // 65

  // Compute calendar-day offset to the start of this quarter
  const buffers = [
    config.bufferWeeks.afterQ1,
    config.bufferWeeks.afterQ2,
    config.bufferWeeks.afterQ3,
    config.bufferWeeks.afterQ4,
  ];

  let calOffset = 0;
  let sprintCounter = 1;
  for (let q = 0; q < quarter - 1; q++) {
    calOffset += quarterCalDays;
    const sprintsInQ = Math.floor(workDaysPerQuarter / config.sprintLengthDays);
    sprintCounter += sprintsInQ;
    calOffset += buffers[q] * DAYS_PER_WEEK;
  }

  const quarterStart = new Date(configStart.getTime() + calOffset * MS_PER_DAY);
  const sprintsInQuarter = Math.floor(
    workDaysPerQuarter / config.sprintLengthDays
  );
  const remainderDays =
    workDaysPerQuarter - sprintsInQuarter * config.sprintLengthDays;

  const blocks: SprintBlock[] = [];
  let dayPtr = quarterStart;

  for (let s = 0; s < sprintsInQuarter; s++) {
    const isLast = s === sprintsInQuarter - 1;
    const targetWD = isLast
      ? config.sprintLengthDays + remainderDays
      : config.sprintLengthDays;

    const startDate = dayPtr;
    let wdCount = 0;
    let calDays = 0;

    while (wdCount < targetWD) {
      const d = new Date(dayPtr.getTime() + calDays * MS_PER_DAY);
      if (!isWeekendDay(d)) wdCount++;
      calDays++;
    }

    // endDate is the last working day (back up from the calDays pointer)
    // calDays now points one past the last counted day
    let endOffset = calDays - 1;
    let endDate = new Date(dayPtr.getTime() + endOffset * MS_PER_DAY);
    // Make sure we land on a working day
    while (isWeekendDay(endDate) && endOffset > 0) {
      endOffset--;
      endDate = new Date(dayPtr.getTime() + endOffset * MS_PER_DAY);
    }

    blocks.push({
      sprintNumber: sprintCounter + s,
      workingDays: targetWD,
      startDate,
      endDate,
    });

    dayPtr = new Date(dayPtr.getTime() + calDays * MS_PER_DAY);
    // Skip any trailing weekend days to start next sprint on a weekday
    while (isWeekendDay(dayPtr)) {
      dayPtr = new Date(dayPtr.getTime() + MS_PER_DAY);
    }
  }

  return blocks;
}

function formatShortDate(date: Date): string {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

export default function SprintCalendar({
  info,
  config,
}: {
  info: SprintInfo;
  config: SprintConfig;
}) {
  if (info.isBufferWeek) return null;

  const blocks = getQuarterSprints(info.quarter, config);

  return (
    <div className="w-full max-w-2xl">
      <h3 className="text-xs font-mono text-text-muted mb-3 tracking-wide uppercase">
        Q{info.quarter} Sprints
      </h3>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {blocks.map((block) => {
          const isCurrent =
            !info.isWeekend && info.sprintNumber === block.sprintNumber;
          const isWeekendCurrent =
            info.isWeekend &&
            info.weekendContext &&
            (info.weekendContext.lastSprintNumber === block.sprintNumber ||
              info.weekendContext.nextSprintNumber === block.sprintNumber);

          return (
            <div
              key={block.sprintNumber}
              className={`group relative flex flex-col items-center justify-center rounded-lg py-3 transition-colors cursor-default ${
                isCurrent
                  ? "bg-accent-dim text-text ring-1 ring-accent/40"
                  : isWeekendCurrent
                    ? "bg-accent-dim/30 text-text"
                    : "bg-surface text-text-muted hover:bg-surface/80"
              }`}
            >
              <span className="text-[0.65rem] font-mono uppercase tracking-wide opacity-60">
                Sprint
              </span>
              <span
                className={`text-lg font-mono font-bold ${
                  isCurrent ? "text-accent" : ""
                }`}
              >
                {block.sprintNumber}
              </span>
              <span className="text-[0.6rem] font-mono opacity-50">
                {block.workingDays}d
              </span>

              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-bg-subtle text-text text-xs font-mono px-2 py-1 rounded border border-border whitespace-nowrap">
                  {formatShortDate(block.startDate)} –{" "}
                  {formatShortDate(block.endDate)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
