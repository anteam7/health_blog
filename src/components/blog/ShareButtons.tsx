"use client";

import { useEffect, useState } from "react";

interface Props {
  url: string; // 절대 URL (https://...)
  title: string;
  description?: string;
  imageUrl?: string;
}

declare global {
  interface Window {
    Kakao?: {
      isInitialized: () => boolean;
      init: (key: string) => void;
      Share?: {
        sendDefault: (options: Record<string, unknown>) => void;
      };
    };
  }
}

// Web Share API + X intent + Facebook + 카카오톡 공유 + 링크 복사
export default function ShareButtons({ url, title, description, imageUrl }: Props) {
  const [toast, setToast] = useState<string | null>(null);
  const [kakaoReady, setKakaoReady] = useState(false);
  const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;

  // Kakao SDK init (env 게이트, 멱등)
  useEffect(() => {
    if (!kakaoKey) return;
    let stopped = false;
    function tryInit() {
      if (stopped) return;
      if (window.Kakao?.isInitialized?.()) {
        setKakaoReady(true);
        return;
      }
      if (window.Kakao && !window.Kakao.isInitialized()) {
        try {
          window.Kakao.init(kakaoKey!);
          setKakaoReady(true);
          return;
        } catch {
          // ignore
        }
      }
      // SDK 아직 로드 안 됨 — 짧게 폴링
      window.setTimeout(tryInit, 200);
    }
    tryInit();
    return () => {
      stopped = true;
    };
  }, [kakaoKey]);

  function shareKakao() {
    if (!window.Kakao?.Share) {
      showToast("카카오 SDK 로딩 중이에요");
      return;
    }
    try {
      window.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title,
          description: description ?? title,
          imageUrl: imageUrl ?? `${new URL(url).origin}/og-image.jpg`,
          link: { mobileWebUrl: url, webUrl: url },
        },
        buttons: [
          { title: "글 보기", link: { mobileWebUrl: url, webUrl: url } },
        ],
      });
    } catch {
      showToast("카카오톡 공유 실패");
    }
  }

  function showToast(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(null), 1500);
  }

  async function shareNative() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ url, title });
      } catch {
        // 사용자 취소 — no-op
      }
    } else {
      await copyLink();
    }
  }

  function shareTwitter() {
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      title,
    )}&url=${encodeURIComponent(url)}`;
    window.open(intent, "_blank", "noopener,noreferrer,width=600,height=480");
  }

  function shareFacebook() {
    const intent = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      url,
    )}`;
    window.open(intent, "_blank", "noopener,noreferrer,width=600,height=480");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      showToast("링크가 복사됐어요");
    } catch {
      showToast("복사 실패 — 직접 복사해주세요");
    }
  }

  const btn =
    "inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-gray-400 hover:text-gray-900 transition-colors";

  return (
    <section className="mt-10 flex items-center gap-2 flex-wrap relative">
      <span className="text-xs text-gray-500 mr-1">공유</span>

      <button type="button" onClick={shareNative} className={btn} aria-label="공유">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v14"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        공유
      </button>

      {kakaoReady && (
        <button
          type="button"
          onClick={shareKakao}
          className="inline-flex items-center gap-1.5 rounded-full border border-yellow-300 bg-yellow-300 px-3 py-1.5 text-xs font-semibold text-stone-900 hover:bg-yellow-400 hover:border-yellow-400 transition-colors"
          aria-label="카카오톡으로 공유"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 3C6.48 3 2 6.48 2 10.78c0 2.74 1.83 5.14 4.6 6.55-.2.7-.74 2.6-.85 3.01-.13.5.18.5.39.36.16-.11 2.6-1.77 3.66-2.5.72.1 1.46.16 2.2.16 5.52 0 10-3.48 10-7.78S17.52 3 12 3z" />
          </svg>
          카카오톡
        </button>
      )}

      <button type="button" onClick={shareTwitter} className={btn} aria-label="X에 공유">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M18.244 2H21l-6.49 7.43L22 22h-6.844l-4.79-6.31L4.8 22H2l6.94-7.94L2 2h6.99l4.31 5.71L18.244 2zm-2.404 18h1.58L7.84 4H6.16l9.68 16z" />
        </svg>
        X
      </button>

      <button
        type="button"
        onClick={shareFacebook}
        className={btn}
        aria-label="Facebook 에 공유"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.79c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
        </svg>
        Facebook
      </button>

      <button type="button" onClick={copyLink} className={btn} aria-label="링크 복사">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        링크 복사
      </button>

      {toast && (
        <span
          role="status"
          aria-live="polite"
          className="absolute -top-9 left-0 rounded-md bg-gray-900 px-3 py-1 text-xs text-white shadow"
        >
          {toast}
        </span>
      )}
    </section>
  );
}
