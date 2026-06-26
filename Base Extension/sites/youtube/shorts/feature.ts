(() => {
  const subscriptionsPath = "/feed/subscriptions";

  const feature: NoAlgorithmsFeature = {
    id: "youtube.shorts",
    site: "youtube",
    cssPath: "sites/youtube/shorts/style.css",

    shouldRedirect(_context, pathname): string | null {
      return pathname.includes("/shorts") ? subscriptionsPath : null;
    },

    shouldRerouteLink(_context, url): string | null {
      return url.pathname.includes("/shorts") ? subscriptionsPath : null;
    }
  };

  registerNoAlgorithmsFeature(feature);
})();
