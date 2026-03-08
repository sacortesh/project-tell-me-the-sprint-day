import type { SprintInfo } from "@/lib/sprint-config";

export default function SprintDayHero({ info }: { info: SprintInfo }) {
  if (info.isBufferWeek) {
    return (
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-hero font-mono text-accent tracking-tight">
          Planning Week
        </h1>
        <p className="text-subtitle text-text-muted">
          {info.bufferLabel ?? `Buffer · Q${info.quarter}`}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-hero font-mono text-accent tracking-tight">
        Day {info.dayInSprint}
      </h1>
      <p className="text-subtitle text-text-muted">
        Sprint {info.sprintNumber} · Q{info.quarter} · Week{" "}
        {info.weekInQuarter}
      </p>
    </div>
  );
}
