type ExtensionRuntime = {
  getURL(path: string): string;
};

const extensionRuntime = (
  (globalThis as { browser?: { runtime?: ExtensionRuntime } }).browser?.runtime ??
  (globalThis as { chrome?: { runtime?: ExtensionRuntime } }).chrome?.runtime
);

class App implements NoAlgorithmsContext {
  private activeFeatures: NoAlgorithmsFeature[] = [];
  private cssEntries: {
    path: string;
    source: string;
    style: HTMLStyleElement;
  }[] = [];

  constructor() {
    console.log("Initializing app...");

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.start(), { once: true });
    } else {
      this.start();
    }
  }

  public absoluteUrl(path: string): string {
    return `${location.protocol}//${location.host}${path}`;
  }

  public isCurrentSite(site: string): boolean {
    return location.hostname.includes(site);
  }

  private async injectCss(path: string): Promise<void> {
    if (!extensionRuntime) {
      throw new Error("Extension runtime API is not available.");
    }

    const response = await fetch(extensionRuntime.getURL(path));
    const css = await response.text();
    const style = document.createElement("style");
    style.textContent = this.cssForCurrentPath(css);
    document.head.appendChild(style);
    this.cssEntries.push({ path, source: css, style });
    console.log(`Injected CSS: ${path}`);
  }

  private cssForCurrentPath(css: string): string {
    const lines = css.split("\n");
    let sectionPath: string | null = null;

    return lines
      .filter(line => {
        const sectionMatch = line.match(/^\s*\/\*\s*(\/\S*)\s*\*\/\s*$/);

        if (sectionMatch) {
          sectionPath = sectionMatch[1];
          return false;
        }

        return !sectionPath || sectionPath === location.pathname;
      })
      .join("\n");
  }

  private refreshCssForCurrentPath(): void {
    this.cssEntries.forEach(entry => {
      entry.style.textContent = this.cssForCurrentPath(entry.source);
    });
  }

  private async setUpFeatures(): Promise<void> {
    let features = window.noAlgorithmsFeatures ?? [];

    this.activeFeatures = features.filter(feature =>
      this.isCurrentSite(feature.site) &&
      (feature.metadata?.enabled ?? true) &&
      (!feature.metadata?.enabledUntil || new Date() < new Date(feature.metadata.enabledUntil)) &&
      (!feature.metadata?.scheduleEnabled || isFeatureScheduled(feature.metadata.schedule ?? null))
    );

    await Promise.all(
      this.activeFeatures
        .filter(feature => feature.cssPath)
        .map(feature => this.injectCss(feature.cssPath as string))
    );

    this.activeFeatures.forEach(feature => feature.onStart?.(this));
  }


  private redirectForCurrentPath(): string | null {
    for (const feature of this.activeFeatures) {
      const redirectPath = feature.shouldRedirect?.(this, location.pathname);
      if (redirectPath) return this.absoluteUrl(redirectPath);
    }

    return null;
  }

  private runOnLocationChanged(): void {
    const redirectUrl = this.redirectForCurrentPath();

    if (redirectUrl) {
      window.location.replace(redirectUrl);
      return;
    }

    this.refreshCssForCurrentPath();
    this.activeFeatures.forEach(feature => feature.onLocationChange?.(this));
  }

  private setUpLocationChangeListeners(): void {
    const { pushState, replaceState } = history;

    history.pushState = (...args: Parameters<History["pushState"]>): ReturnType<History["pushState"]> => {
      const result = pushState.apply(history, args);
      this.runOnLocationChanged();
      return result;
    };

    history.replaceState = (...args: Parameters<History["replaceState"]>): ReturnType<History["replaceState"]> => {
      const result = replaceState.apply(history, args);
      this.runOnLocationChanged();
      return result;
    };

    window.addEventListener("popstate", () => this.runOnLocationChanged());
    window.addEventListener("hashchange", () => this.runOnLocationChanged());
  }

  private rerouteLinks(root: Document | HTMLElement = document): void {
    root.querySelectorAll<HTMLAnchorElement>("a[href]").forEach(link => {
      const dataset = link.dataset as DOMStringMap;
      if (dataset.noalgProcessed) return;

      const href = link.getAttribute("href");
      if (!href) return;

      let url: URL;
      try {
        url = new URL(href, location.origin);
      } catch {
        dataset.noalgProcessed = "1";
        return;
      }

      if (!this.activeFeatures.some(feature => url.hostname.includes(feature.site))) {
        dataset.noalgProcessed = "1";
        return;
      }

      for (const feature of this.activeFeatures) {
        const redirectPath = feature.shouldRerouteLink?.(this, url);
        if (!redirectPath) continue;

        link.setAttribute("og_href", href);
        link.setAttribute("href", this.absoluteUrl(redirectPath));
        dataset.noalgHomeLink = "1";
        break;
      }

      dataset.noalgProcessed = "1";
    });
  }

  private forceReroutedLinks(event: MouseEvent): void {
    if (event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = event.composedPath().find(el =>
      el instanceof HTMLAnchorElement
    ) as HTMLAnchorElement | undefined;

    if (!link?.dataset.noalgHomeLink) return;

    event.preventDefault();
    event.stopPropagation();
    window.location.assign(link.href);
  }

  private runDomFeatures(root: Document | HTMLElement = document): void {
    this.rerouteLinks(root);
    this.activeFeatures.forEach(feature => feature.onDomChange?.(this, root));
  }

  public async start(): Promise<void> {
    await this.setUpFeatures().catch(err => console.error("Failed to set up features", err));

    this.runOnLocationChanged();
    this.runDomFeatures(document);
    this.setUpLocationChangeListeners();

    document.addEventListener("click", this.forceReroutedLinks.bind(this), true);

    let scheduled = false;

    const observer = new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;

      requestAnimationFrame(() => {
        this.runDomFeatures(document);
        this.runOnLocationChanged();
        scheduled = false;
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }
}

const app = new App();

console.log("Running app...", app);
