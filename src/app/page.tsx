import { getSprintInfo } from "@/lib/sprint-engine";
import { DEFAULT_CONFIG } from "@/lib/sprint-config";
import { getTips } from "@/lib/sprint-tips";
import SprintDayHero from "@/components/SprintDayHero";
import SprintAlignmentBox from "@/components/SprintAlignmentBox";
import SprintProgress from "@/components/SprintProgress";
import QuarterTimeline from "@/components/QuarterTimeline";
import SprintCalendar from "@/components/SprintCalendar";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default function Home() {
  const info = getSprintInfo(new Date(), DEFAULT_CONFIG);
  const tips = getTips(info.dayInSprint, info.isWeekend, info.isBufferWeek);

  return (
    <div className="flex flex-col items-center gap-12">
      <SprintDayHero info={info} />
      <SprintProgress info={info} />
      <QuarterTimeline info={info} config={DEFAULT_CONFIG} />
      <SprintCalendar info={info} config={DEFAULT_CONFIG} />
      <SprintAlignmentBox tips={tips} />
    </div>
  );
}
