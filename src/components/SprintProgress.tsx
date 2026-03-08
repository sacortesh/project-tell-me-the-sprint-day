import type { SprintInfo } from "@/lib/sprint-config";

export default function SprintProgress({ info }: { info: SprintInfo }) {
  if (info.isBufferWeek) {
    return null;
  }

  const day = info.isWeekend
    ? info.weekendContext?.lastWorkDay ?? 0
    : info.dayInSprint;

  const percentage = Math.round((day / info.totalSprintDays) * 100);

  return (
    <div className="w-full max-w-md">
      <div className="h-1.5 w-full rounded-full bg-surface overflow-hidden">
        <div
          className="h-full rounded-full bg-accent-dim transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-2 text-center text-sm text-text-muted">
        {day} of {info.totalSprintDays} days
      </p>
    </div>
  );
}
