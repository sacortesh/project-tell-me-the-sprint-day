import { getSprintInfo } from "@/lib/sprint-engine";
import { DEFAULT_CONFIG } from "@/lib/sprint-config";
import SprintDayHero from "@/components/SprintDayHero";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default function Home() {
  const info = getSprintInfo(new Date(), DEFAULT_CONFIG);

  return <SprintDayHero info={info} />;
}
