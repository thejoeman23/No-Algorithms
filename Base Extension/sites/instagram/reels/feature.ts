(() => {
  const feature: NoAlgorithmsFeature = {
    id: "instagram.reels",
    site: "instagram",
    cssPath: "sites/instagram/reels/style.css",

    shouldRedirect(_context, pathname): string | null {
      return pathname.includes("/reels") ? "/" : null;
    },

    shouldRerouteLink(_context, url): string | null {
      return url.pathname.includes("/reels") ? "/" : null;
    }
  };

  registerNoAlgorithmsFeature(feature);
})();
