import type { SprintConfig, SprintInfo } from "@/lib/sprint-config";

const WEEKS_PER_QUARTER = 13;
const DAYS_PER_WEEK = 7;

interface TimelineSegment {
  kind: "quarter" | "buffer";
  quarter: number;
  calendarDays: number;
  label: string;
}

function buildTimelineSegments(config: SprintConfig): TimelineSegment[] {
  const buffers = [
    config.bufferWeeks.afterQ1,
    config.bufferWeeks.afterQ2,
    config.bufferWeeks.afterQ3,
    config.bufferWeeks.afterQ4,
  ];
  const quarterDays = WEEKS_PER_QUARTER * DAYS_PER_WEEK; // 91

  const segments: TimelineSegment[] = [];

  for (let q = 0; q < 4; q++) {
    const quarter = q + 1;
    segments.push({
      kind: "quarter",
      quarter,
      calendarDays: quarterDays,
      label: `Q${quarter}`,
    });

    const bufferDays = buffers[q] * DAYS_PER_WEEK;
    if (bufferDays > 0) {
      segments.push({
        kind: "buffer",
        quarter,
        calendarDays: bufferDays,
        label: "",
      });
    }
  }

  return segments;
}

export default function QuarterTimeline({
  info,
  config,
}: {
  info: SprintInfo;
  config: SprintConfig;
}) {
  const segments = buildTimelineSegments(config);
  const totalDays = segments.reduce((sum, s) => sum + s.calendarDays, 0);

  return (
    <div className="w-full max-w-2xl">
      <div className="flex h-8 rounded-lg overflow-hidden gap-px bg-border">
        {segments.map((seg, i) => {
          const widthPct = (seg.calendarDays / totalDays) * 100;
          const isCurrent =
            seg.kind === "quarter"
              ? seg.quarter === info.quarter && !info.isBufferWeek
              : seg.quarter === info.quarter && info.isBufferWeek;

          return (
            <div
              key={i}
              className={`relative flex items-center justify-center transition-colors ${
                seg.kind === "buffer"
                  ? isCurrent
                    ? "bg-accent-dim/40"
                    : "bg-surface/50"
                  : isCurrent
                    ? "bg-accent-dim"
                    : "bg-surface"
              }`}
              style={{ width: `${widthPct}%` }}
            >
              {seg.kind === "quarter" && (
                <span
                  className={`text-xs font-mono tracking-wide ${
                    isCurrent ? "text-text" : "text-text-muted"
                  }`}
                >
                  {seg.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
