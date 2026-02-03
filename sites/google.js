console.log(location.origin);

const TARGET_SELECTOR = [".XDyW0e", ".lnXdpd"].join(", ");

function removeRecommendations(root = document) {
  const nodes = root.querySelectorAll(TARGET_SELECTOR);
  nodes.forEach(el => el.remove());
  if (nodes.length > 0) {
    console.log("removed", nodes.length);
  }
}

function start() {
  removeRecommendations();

  const observer = new MutationObserver(() => {
    removeRecommendations();
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
