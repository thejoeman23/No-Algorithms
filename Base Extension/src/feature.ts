interface NoAlgorithmsContext {
  absoluteUrl(path: string): string;
  isCurrentSite(site: string): boolean;
}

interface NoAlgorithmsFeature {
  id: string;
  site: string;
  cssPath?: string;
  onStart?(context: NoAlgorithmsContext): void;
  onLocationChange?(context: NoAlgorithmsContext): void;
  onDomChange?(context: NoAlgorithmsContext, root: Document | HTMLElement): void;
  shouldRedirect?(context: NoAlgorithmsContext, pathname: string): string | null;
  shouldRerouteLink?(context: NoAlgorithmsContext, url: URL): string | null;
}

interface Window {
  noAlgorithmsFeatures?: NoAlgorithmsFeature[];
}

function registerNoAlgorithmsFeature(feature: NoAlgorithmsFeature): void {
  window.noAlgorithmsFeatures ??= [];
  window.noAlgorithmsFeatures.push(feature);
}
