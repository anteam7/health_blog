"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

export interface AdSlotProps {
  /** AdSense ad slot id (from your AdSense dashboard). */
  slot?: string;
  /** Display format. Default "fluid" with layoutKey for in-article. */
  format?: "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";
  /** AdSense layout key for in-article placement. */
  layout?: "in-article" | string;
  /** Hint shown to render a min-height reserved area (prevents CLS). */
  minHeight?: number;
  /** Optional className wrapper override. */
  className?: string;
  /** Debug label visible only when env client is unset (helps preview placement). */
  debugLabel?: string;
}

/**
 * AdSense slot — strict env-gated.
 *
 * - Renders nothing when `NEXT_PUBLIC_ADSENSE_CLIENT` env or `slot` prop is missing.
 *   Lets us pre-place slots in the layout long before AdSense approval, with zero
 *   visual / network impact until env is set.
 * - Reserves vertical space via `minHeight` to prevent CLS on load.
 * - Respects YMYL policy: never used on policy / disclaimer / contact pages.
 *   Caller controls placement; this component only renders when configured.
 */
export default function AdSlot({
  slot,
  format = "fluid",
  layout = "in-article",
  minHeight = 280,
  className,
  debugLabel,
}: AdSlotProps) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const insRef = useRef<HTMLModElement | null>(null);

  useEffect(() => {
    if (!client || !slot) return;
    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch {
      // adsbygoogle script may not be loaded yet; ignore.
    }
  }, [client, slot]);

  if (!client || !slot) {
    // env 또는 slot 미설정 시 항상 미렌더 (dev·prod 동일).
    // 광고 슬롯 자리 디버그가 필요하면 NEXT_PUBLIC_ADSENSE_DEBUG=1 환경변수로 켜기.
    if (
      process.env.NODE_ENV !== "production" &&
      process.env.NEXT_PUBLIC_ADSENSE_DEBUG === "1" &&
      debugLabel
    ) {
      return (
        <div
          className={`my-6 rounded border border-dashed border-gray-300 bg-gray-50 p-4 text-center text-xs text-gray-400 ${className ?? ""}`}
          style={{ minHeight }}
        >
          [AdSlot · {debugLabel}] env=NEXT_PUBLIC_ADSENSE_CLIENT 미설정 — 미렌더
        </div>
      );
    }
    return null;
  }

  return (
    <div className={`my-6 ${className ?? ""}`} style={{ minHeight }}>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        {...(format === "fluid" && layout ? { "data-ad-layout": layout } : {})}
        data-full-width-responsive="true"
      />
    </div>
  );
}
