"use client";

import { useEffect } from "react";

export function CacheBuster() {
  useEffect(() => {
    // Ajouter un timestamp à tous les liens pour éviter le cache
    const addTimestampToLinks = () => {
      const links = document.querySelectorAll('link[rel="stylesheet"]');
      const scripts = document.querySelectorAll("script[src]");

      const timestamp = Date.now();

      links.forEach(link => {
        const href = link.getAttribute("href");
        if (href && !href.includes("?")) {
          link.setAttribute("href", `${href}?v=${timestamp}`);
        }
      });

      scripts.forEach(script => {
        const src = script.getAttribute("src");
        if (src && !src.includes("?")) {
          script.setAttribute("src", `${src}?v=${timestamp}`);
        }
      });
    };

    // En développement, ajouter le timestamp
    if (process.env.NODE_ENV === "development") {
      addTimestampToLinks();

      // Observer les changements DOM pour les nouveaux éléments
      const observer = new MutationObserver(addTimestampToLinks);
      observer.observe(document.head, { childList: true });

      return () => observer.disconnect();
    }
  }, []);

  return null;
}
