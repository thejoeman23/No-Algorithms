(() => {
  let articleCounter = 0;

  const feature: NoAlgorithmsFeature = {
    id: "instagram.recommendations",
    site: "instagram",
    cssPath: "sites/instagram/recommendations/style.css",

    onDomChange(_context, root): void {
      if (_context.absoluteUrl(location.href).includes("/p/"))
        return;

      root.querySelectorAll("article").forEach(article => {
        if (article.getAttribute("isRecommendation")) return;

        const isRecommendation = [...article.querySelectorAll("div")].some(el =>
          el.textContent?.toLowerCase().includes("follow") ||
          el.textContent?.toLowerCase().includes("suggested for you")
        );

        article.setAttribute("isRecommendation", String(isRecommendation));
        articleCounter++;
        console.log(`Tagged article #${articleCounter} as ${isRecommendation ? "recommendation" : "not recommendation"}`);
      });
    }
  };

  registerNoAlgorithmsFeature(feature);
})();
