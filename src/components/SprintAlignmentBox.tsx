import type { AlignmentTips } from "@/lib/sprint-tips";

export default function SprintAlignmentBox({ tips }: { tips: AlignmentTips }) {
  return (
    <div className="grid grid-cols-3 gap-px bg-border rounded-lg overflow-hidden max-w-2xl w-full">
      <Column label="Lawful" text={tips.lawful} />
      <Column label="Neutral" text={tips.neutral} />
      <Column label="Chaotic" text={tips.chaotic} />
    </div>
  );
}

function Column({ label, text }: { label: string; text: string }) {
  return (
    <div className="bg-surface p-4 flex flex-col gap-2">
      <span className="text-xs font-mono uppercase tracking-widest text-text-muted">
        {label}
      </span>
      <p className="text-sm text-text leading-relaxed">{text}</p>
    </div>
  );
}
