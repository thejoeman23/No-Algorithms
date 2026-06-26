(() => {
  const subscriptionsPath = "/feed/subscriptions";

  const feature: NoAlgorithmsFeature = {
    id: "youtube.homepage",
    site: "youtube",
    cssPath: "sites/youtube/homepage/style.css",

    onLocationChange(): void {
      if (location.pathname === subscriptionsPath && document.title !== "YouTube") {
        document.title = "YouTube";
      }
    },

    shouldRedirect(_context, pathname): string | null {
      return pathname === "/" ? subscriptionsPath : null;
    },

    shouldRerouteLink(_context, url): string | null {
      return url.pathname === "/" ? subscriptionsPath : null;
    }
  };

  registerNoAlgorithmsFeature(feature);
})();
