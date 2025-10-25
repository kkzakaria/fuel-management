import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
};

// next-pwa uses webpack for service worker generation (production builds)
// Turbopack is used for dev mode only
export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  reloadOnOnline: true, // Recharge l'app quand la connexion revient
  cacheOnFrontEndNav: true, // Cache les pages lors de la navigation
  aggressiveFrontEndNavCaching: true, // Cache agressif pour navigation
  fallbacks: {
    // Fallback pour les pages quand offline
    document: "/~offline",
    // Fallback pour les requêtes API quand offline
    // (géré par notre système de queue)
  },
  workboxOptions: {
    // Exclure les fichiers de build et sourcemaps du précache
    exclude: [
      /\.map$/,
      /^manifest.*\.js$/,
      /_buildManifest\.js$/,
      /_ssgManifest\.js$/,
    ],
    // Stratégies de cache pour différents types de ressources
    runtimeCaching: [
      {
        // Images: Cache First avec fallback
        urlPattern: /^https?.*\.(png|jpg|jpeg|webp|svg|gif|ico)$/,
        handler: "CacheFirst",
        options: {
          cacheName: "images-cache",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours
          },
        },
      },
      {
        // CSS et JS: Stale While Revalidate
        urlPattern: /^https?.*\.(css|js)$/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-resources",
          expiration: {
            maxEntries: 30,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 jours
          },
        },
      },
      {
        // API Supabase: Network First avec fallback vers cache
        urlPattern: ({ url }) => {
          return url.hostname.includes("supabase.co");
        },
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 1 jour
          },
        },
      },
      {
        // Pages Next.js: Network First
        urlPattern: /^https?:\/\/localhost(:\d+)?\/.*$/,
        handler: "NetworkFirst",
        options: {
          cacheName: "pages-cache",
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 30,
            maxAgeSeconds: 24 * 60 * 60, // 1 jour
          },
        },
      },
    ],
  },
})(nextConfig);
