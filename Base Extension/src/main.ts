// ============================================================
// No Algorithms - YouTube Script
// Purpose: Remove algorithmic surfaces and redirect the user
//          to subscriptions-only browsing.
// ============================================================

interface PathTitle {
  path: string;
  title: string;
}

interface Settings {
  website_name: string;
  home_path: string;
  blocked_paths: string[];
  remove_links_to_path: string[]
  custom_path_titles: PathTitle[];
}

class App {
  private settings!: Settings;

  constructor() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.start(), { once: true });
    } else {
      this.start();
    }

    console.log("Running constructor...");
  }

  async set_up_settings() {
    // Dynamically load settings.json for the matching site
    const siteListResponse = await fetch(chrome.runtime.getURL("sites/index.json"));
    const siteFolders: string[] = await siteListResponse.json();
    console.log(`Site folders: ${siteFolders}`);

    for (const folder of siteFolders) {
      const settingsUrl = chrome.runtime.getURL(`sites/${folder}/settings.json`);
      const settingsResponse = await fetch(settingsUrl);
      this.settings = await settingsResponse.json();
      console.log(`Settings: ${this.settings}`);
      console.log(`Settings: ${JSON.stringify(this.settings)}`);
      break; // stop after first found site
    }
  }

  private is_correct_website(): boolean {
    return location.hostname.includes(this.settings.website_name);
  }

  private shouldRedirect(pathname: string): boolean {
    for (const blockedPath of this.settings.blocked_paths) {
      if (pathname.startsWith(blockedPath)) {
        return true;
      }
    }
    return false;
  }

  private redirections(): void {
    if (!this.is_correct_website()) return;

    if (this.shouldRedirect(location.pathname) && location.pathname !== this.settings.home_path) {
      const home_url: string = `${location.protocol}//${location.host}${this.settings.home_path}`;
      window.location.replace(home_url);
    }
  }

  private renameDocumentTitle(): void {
    if (!this.is_correct_website()) return;

    for (const customTitle of this.settings.custom_path_titles) {
      if (location.pathname === customTitle.path && document.title !== customTitle.title) {
        document.title = customTitle.title;
        break;
      }
    }
  }

  private rerouteLinks(root: Document | HTMLElement = document): void {
    root.querySelectorAll("a[href]").forEach((link) => {
      const href: string | null = link.getAttribute("href");
      if (!href) return;

      // Remove links that match remove_links_to_path
      for (const removePath of this.settings.remove_links_to_path) {
        if (href.startsWith(removePath)) {
          link.parentElement?.remove();
          return;
        }
      }

      let url: URL;
      try {
        url = new URL(href, location.origin);
      } catch {
        return;
      }

      const isTargetUrl: boolean =
        url.hostname === "youtube.com" || url.hostname.endsWith(".youtube.com");

      if (!isTargetUrl) return;

      // Redirect links that match blocked_paths to home_path
      for (const blockedPath of this.settings.blocked_paths) {
        if (url.pathname.startsWith(blockedPath)) {
          const home_url: string = `${location.protocol}//${location.host}${this.settings.home_path}`;
          link.setAttribute("href", home_url);
          // @ts-ignore
          (link.dataset as DOMStringMap)["noalgHomeLink"] = "1";
          break;
        }
      }
    });
  }

  /*
  private forceSubscriptionsNavigation(event: MouseEvent): void {
    if (event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const target = event.target as HTMLElement | null;
    if (!target) return;

    const link = target.closest('a[data-noalg-home-link="1"]') as HTMLAnchorElement | null;
    if (!link) return;

    event.preventDefault();
    event.stopPropagation();

    const subscriptionsUrl: string = `${location.protocol}//${location.host}${this.settings.home_path}`;
    window.location.assign(subscriptionsUrl);
  }
  */

  private movePlaylistLocation(root: Document | HTMLElement = document): void {
    const videoEl = document.querySelector("ytd-watch-flexy") as HTMLElement | null;
    const sidebarEl = document.querySelector("#secondary-inner") as HTMLElement | null;
    if (!videoEl) return;
    if (!sidebarEl) return;

    if (!videoEl.hasAttribute("playlist") && !sidebarEl.contains(document.querySelector("#chat-container") as HTMLElement | null)) {
      const style = document.createElement("style");
      style.textContent = "#secondary { filter: blur(10px) }";
      document.head.appendChild(style);

      return;
    }
    if (videoEl.hasAttribute("theater")) return;

    videoEl.removeAttribute("is-two-columns_");
    videoEl.setAttribute("is_single_column_", "");
  }

  private addInfoCardToRecommendations(): void {
    const sidebarEl = document.querySelector("#secondary-inner") as HTMLElement | null;

    if (!sidebarEl) return;
    if (document.querySelector("#info-card")) return;

    const infoEl = document.createElement("div");
    infoEl.id = "info-card";
    infoEl.classList.add("info-card");

    const textEl1 = document.createElement("span");
    textEl1.textContent = "What next?";
    textEl1.id = "info-card-top-text";
    const textEl2 = document.createElement("span");
    textEl2.textContent = "YOU decide.";
    textEl2.id = "info-card-main-text";

    const buttonEl = document.createElement("button");
    buttonEl.textContent = "Search";
    buttonEl.id = "info-card-button";

    sidebarEl.insertBefore(infoEl, sidebarEl.firstChild);
    infoEl.append(textEl1);
    infoEl.append(textEl2);
    infoEl.append(buttonEl);

    buttonEl.addEventListener("click", () => {
      const searchbox = document.querySelector('[name="search_query"') as HTMLElement | null;
      searchbox?.focus();
    });
  }

  private runOnLocationChanged(): void {
    this.redirections();
  }

  private setupLocationChangeListeners(): void {
    const { pushState, replaceState } = history;

    const self = this;

    history.pushState = function (...args: any[]): any {
      const result = pushState.apply(this, args);
      self.runOnLocationChanged();
      return result;
    };

    history.replaceState = function (...args: any[]): any {
      const result = replaceState.apply(this, args);
      self.runOnLocationChanged();
      return result;
    };

    window.addEventListener("popstate", () => this.runOnLocationChanged());
    window.addEventListener("hashchange", () => this.runOnLocationChanged());
  }

  public async start(): Promise<void> {
    await this.set_up_settings().catch(err => console.error("Failed to load settings", err));
    this.redirections();
    this.addInfoCardToRecommendations();

    this.setupLocationChangeListeners();

    // document.addEventListener("click", this.forceSubscriptionsNavigation.bind(this), true);

    const observer = new MutationObserver(() => {
      requestAnimationFrame(() => {
        this.rerouteLinks();
        this.addInfoCardToRecommendations();
        this.renameDocumentTitle();
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }
}

const app = new App();

console.log("Running app...");
