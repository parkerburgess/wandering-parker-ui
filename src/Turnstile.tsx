"use client";

import { useEffect, useRef } from "react";

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";

interface TurnstileApi {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    },
  ) => string;
  remove: (id: string) => void;
  reset: (id: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

interface TurnstileProps {
  /** Cloudflare's public site key. Nothing renders when it's missing. */
  siteKey?: string;
  /** Must be stable (a state setter or useCallback), or the widget re-renders. */
  onToken: (token: string) => void;
  /**
   * Bump this to reset the widget. Turnstile tokens are single-use, so a
   * retry after a failed submit needs a fresh one.
   */
  resetKey?: number;
}

// Renders a Cloudflare Turnstile widget and hands its token back via onToken.
// Renders nothing without a site key, so forms still work in environments
// where Turnstile isn't set up.
export function Turnstile({ siteKey, onToken, resetKey }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!siteKey) return;
    const key = siteKey;

    function clearToken() {
      onToken("");
    }

    function render() {
      if (!containerRef.current || !window.turnstile || widgetIdRef.current) {
        return;
      }
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: key,
        callback: onToken,
        "expired-callback": clearToken,
        "error-callback": clearToken,
      });
    }

    function removeWidget() {
      if (window.turnstile && widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    }

    if (window.turnstile) {
      render();
      return removeWidget;
    }

    const selector = `script[src="${SCRIPT_SRC}"]`;
    const existing = document.querySelector<HTMLScriptElement>(selector);
    const script = existing ?? createScript();
    script.addEventListener("load", render);

    function cleanup() {
      script.removeEventListener("load", render);
      removeWidget();
    }
    return cleanup;
  }, [siteKey, onToken]);

  useEffect(() => {
    if (!resetKey) return;
    if (window.turnstile && widgetIdRef.current) {
      window.turnstile.reset(widgetIdRef.current);
      onToken("");
    }
  }, [resetKey, onToken]);

  return <div ref={containerRef} />;
}

function createScript(): HTMLScriptElement {
  const script = document.createElement("script");
  script.src = SCRIPT_SRC;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
  return script;
}
