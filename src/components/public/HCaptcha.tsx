"use client";

import { useEffect, useRef } from "react";

// Minimal hCaptcha widget loader (avoids the @hcaptcha/react-hcaptcha dependency).
// Renders an invisible/normal hCaptcha and reports the token via onVerify.

declare global {
  interface Window {
    hcaptcha?: {
      render: (container: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      execute: (id?: string) => void;
    };
    __hcaptchaLoading?: Promise<void>;
  }
}

function loadScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.hcaptcha) return Promise.resolve();
  if (window.__hcaptchaLoading) return window.__hcaptchaLoading;

  window.__hcaptchaLoading = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://js.hcaptcha.com/1/api.js?render=explicit";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("hcaptcha script failed"));
    document.head.appendChild(s);
  });
  return window.__hcaptchaLoading;
}

export function HCaptcha({
  onVerify,
  onExpire,
}: {
  onVerify: (token: string) => void;
  onExpire?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;
    let cancelled = false;

    loadScript()
      .then(() => {
        if (cancelled || !window.hcaptcha || !containerRef.current) return;
        widgetIdRef.current = window.hcaptcha.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => onVerify(token),
          "expired-callback": () => onExpire?.(),
        });
      })
      .catch((err) => console.error(err));

    return () => {
      cancelled = true;
    };
  }, [siteKey, onVerify, onExpire]);

  if (!siteKey) {
    return (
      <p className="text-xs text-muted-foreground">
        hCaptcha disabled (no site key configured).
      </p>
    );
  }

  return <div ref={containerRef} />;
}
