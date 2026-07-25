interface NoAlgorithmsContext {
  absoluteUrl(path: string): string;
  isCurrentSite(site: string): boolean;
}

interface NoAlgorithmsFeature {
  id: string;
  site: string;
  cssPath?: string;
  metadata?: NoAlgorithmsFeatureMetadata;
  onStart?(context: NoAlgorithmsContext): void;
  onLocationChange?(context: NoAlgorithmsContext): void;
  onDomChange?(context: NoAlgorithmsContext, root: Document | HTMLElement): void;
  shouldRedirect?(context: NoAlgorithmsContext, pathname: string): string | null;
  shouldRerouteLink?(context: NoAlgorithmsContext, url: URL): string | null;
}

interface NoAlgorithmsFeatureMetadata {
  enabled?: boolean;
  schedule?: FeatureSchedule;
  scheduleEnabled?: boolean;
  enabledUntil?: string;
}

interface FeatureSchedule {
  days: ScheduleDay[];
}

interface ScheduleDay {
  day: Weekday;
  blocks: ScheduleBlock[];
}

type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

interface ScheduleBlock {
  startTime: string;
  endTime: string;
}

interface Window {
  noAlgorithmsFeatures?: NoAlgorithmsFeature[];
}

function registerNoAlgorithmsFeature(feature: NoAlgorithmsFeature): void {
  window.noAlgorithmsFeatures ??= [];
  window.noAlgorithmsFeatures.push(feature);
}

function isFeatureScheduled(schedule: FeatureSchedule | null): boolean {
  if (!schedule) return false;

  const now = new Date();
  const currentDay = now.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase() as Weekday;
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const daySchedule = schedule.days.find(day => day.day === currentDay);
  if (!daySchedule) return false;

  return daySchedule.blocks.some(block => {
    const [startHour, startMinute] = block.startTime.split(":").map(Number);
    const [endHour, endMinute] = block.endTime.split(":").map(Number);

    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    return currentTime >= startTime && currentTime <= endTime;
  });
}