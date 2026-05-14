import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// CSP — allow YouTube embeds, hCaptcha widget, Resend (forms call it server-side
// but the marketing email tracking pixel sometimes loads client-side).
const CSP = [
  "default-src 'self'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://hcaptcha.com https://*.hcaptcha.com",
  "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://hcaptcha.com https://*.hcaptcha.com",
  "connect-src 'self' https://hcaptcha.com https://*.hcaptcha.com https://api.resend.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "**.up.railway.app" },
      { protocol: "https", hostname: "riseuptogether.co.uk" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
