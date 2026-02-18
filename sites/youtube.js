console.log(location.origin);

const isYouTubeHost =
  location.hostname === "youtube.com" ||
  location.hostname.endsWith(".youtube.com");
const subscriptionsPath = "/feed/subscriptions";
const subscriptionsUrl = `${location.protocol}//${location.host}${subscriptionsPath}`;

let removed_items = false;
let observer;
let previousLocationHref = location.href;

function redirections(root = document) {
  if (isYouTubeHost && location.pathname === "/") {
    window.location.replace(subscriptionsUrl);
  }

  if (isYouTubeHost && location.pathname.startsWith("/shorts")) {
    window.location.replace(subscriptionsUrl);
  }

  if (isYouTubeHost && location.pathname === subscriptionsPath) {
    document.title = "YouTube";
  }
}

function redirectHomeLinks(root = document) {
  root.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;

    let url;
    try {
      url = new URL(href, location.origin);
    } catch {
      return;
    }

    const isHomePath = url.pathname === "/" && !url.search && !url.hash;
    const isYouTubeUrl =
      url.hostname === "youtube.com" || url.hostname.endsWith(".youtube.com");

    if (isHomePath && isYouTubeUrl) {
      link.setAttribute("href", subscriptionsUrl);
      link.dataset.noalgHomeLink = "1";
    }
    else if (href.startsWith("/shorts")) {
      link.parentElement.remove();
    }
  });
}

function forceSubscriptionsNavigation(event) {
  if (event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const link = event.target.closest('a[data-noalg-home-link="1"]');
  if (!link) return;

  event.preventDefault();
  event.stopPropagation();
  window.location.assign(subscriptionsUrl);
}

function removeRecommendations(root = document) {
  if (removed_items) return;

  const shortsButton = root.querySelector(".pivot-bar-item-tab.pivot-shorts");
  const subscriptionsButton = root.querySelector(".pivot-bar-item-tab.pivot-subs")
  if (shortsButton && subscriptionsButton) {
    shortsButton.parentElement.remove();
    subscriptionsButton.parentElement.remove();
    removed_items = true;

    console.log("removed secondary");
  }
}

function runOnLocationChanged() {
  if (previousLocationHref === location.href) return;
  previousLocationHref = location.href;
  redirections();
}

function setupLocationChangeListeners() {
  const { pushState, replaceState } = history;

  history.pushState = function (...args) {
    const result = pushState.apply(this, args);
    runOnLocationChanged();
    return result;
  };

  history.replaceState = function (...args) {
    const result = replaceState.apply(this, args);
    runOnLocationChanged();
    return result;
  };

  window.addEventListener("popstate", runOnLocationChanged);
  window.addEventListener("hashchange", runOnLocationChanged);
}

function start() {
  redirections();
  redirectHomeLinks();
  removeRecommendations();
  setupLocationChangeListeners();
  document.addEventListener("click", forceSubscriptionsNavigation, true);

  observer = new MutationObserver(() => {
    requestAnimationFrame(() => {
      runOnLocationChanged();
      redirectHomeLinks();
      removeRecommendations();
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}
