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
