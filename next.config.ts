import type { NextConfig } from "next";
import path from "path";

const isDev = process.env.NODE_ENV === "development";

/* ── Content Security Policy ─────────────────────────────────── */
const csp = [
  "default-src 'self'",
  // Scripts — Next.js needs unsafe-eval in dev; allow RPM iframe scripts
  isDev
    ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline'",
  // Styles — Tailwind inlines styles
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Fonts
  "font-src 'self' https://fonts.gstatic.com",
  // Images — Supabase storage, RPM models, data URIs for canvas
  "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in https://models.readyplayer.me https://world.openfoodfacts.org",
  // Connect — Supabase API, Open Food Facts, RPM API
  "connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co https://world.openfoodfacts.org https://*.readyplayer.me",
  // Media — exercise videos from Cloudflare
  "media-src 'self' blob: https://*.cloudflare.com https://*.r2.dev",
  // Worker — needed for Three.js / R3F OffscreenCanvas
  "worker-src 'self' blob:",
  // Frames — Ready Player Me avatar creator (root + all subdomains)
  "frame-src https://readyplayer.me https://*.readyplayer.me",
  // Objects
  "object-src 'none'",
  // Base URI
  "base-uri 'self'",
  // Form actions — only submit to own origin
  "form-action 'self'",
].join("; ");

/* ── Security headers ────────────────────────────────────────── */
const securityHeaders = [
  { key: "Content-Security-Policy",          value: csp },
  { key: "X-Content-Type-Options",           value: "nosniff" },
  { key: "X-Frame-Options",                  value: "SAMEORIGIN" },
  { key: "X-XSS-Protection",                value: "1; mode=block" },
  { key: "Referrer-Policy",                  value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",               value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.supabase.in" },
      { protocol: "https", hostname: "models.readyplayer.me" },
      { protocol: "https", hostname: "world.openfoodfacts.org" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  // Redirect bare /app to dashboard
  async redirects() {
    return [
      {
        source: "/app",
        destination: "/dashboard",
        permanent: false,
      },
    ];
  },

  // Compress responses
  compress: true,

  // Strict mode for catching React issues early
  reactStrictMode: true,

  // Telemetry off in CI
  ...(process.env.CI && { telemetry: false }),
};

export default nextConfig;
