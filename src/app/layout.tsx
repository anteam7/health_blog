import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://healthscanner.co.kr";
const SITE_NAME = "헬스스캐너";
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const GOOGLE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const NAVER_VERIFICATION = process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION;
const KAKAO_APP_KEY = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — 논문·뉴스 근거 건강 정보`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "최신 논문과 뉴스를 근거로 정리한 건강·헬스·다이어트 가이드. 출처를 검증한 정보만 제공합니다.",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "ko_KR",
    url: SITE_URL,
  },
  alternates: {
    canonical: SITE_URL,
    types: {
      "application/rss+xml": `${SITE_URL}/feed.xml`,
    },
  },
  ...(GOOGLE_VERIFICATION || NAVER_VERIFICATION
    ? {
        verification: {
          ...(GOOGLE_VERIFICATION ? { google: GOOGLE_VERIFICATION } : {}),
          ...(NAVER_VERIFICATION
            ? { other: { "naver-site-verification": [NAVER_VERIFICATION] } }
            : {}),
        },
      }
    : {}),
};

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description:
        "최신 의료 논문과 신뢰할 수 있는 매체를 기반으로 한국어로 정리하는 건강·헬스·다이어트 정보 사이트",
      inLanguage: "ko-KR",
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      description:
        "건강·헬스·다이어트 정보를 학술 출처와 함께 한국어로 정리하는 1인 운영 독립 사이트",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* GA disable flag MUST run before gtag/js loads — afterInteractive 단계에서
            gtag('config') 가 실행되기 전에 /admin 경로면 측정을 끔. useEffect 기반
            disable 은 page_view 가 이미 발사된 뒤에 도는 문제가 있어 인라인 동기 스크립트로 처리. */}
        {GA_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `try{if(typeof location!=='undefined'&&location.pathname.indexOf('/admin')===0){window['ga-disable-${GA_ID}']=true;}}catch(e){}`,
            }}
          />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}</Script>
          </>
        )}
        {KAKAO_APP_KEY && (
          <Script
            id="kakao-sdk"
            src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
            integrity="sha384-DKYJZ8NLiK8MN4/C5P2dtSmLQ4KwPaoqAfyA/DfmEc1VDxu4yyC7wy6K1Hs90nka"
            crossOrigin="anonymous"
            strategy="lazyOnload"
          />
        )}
        {ADSENSE_CLIENT && (
          <>
            {/* AdSense·Funding Choices: lazyOnload — 메인스레드 점유로 LCP 영향 최소화.
                AdSlot 의 (adsbygoogle = []).push 는 큐로 동작해서 스크립트가 늦게 도착해도 안전. */}
            <Script
              id="google-adsense"
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
              crossOrigin="anonymous"
              strategy="lazyOnload"
            />
            <Script
              id="google-funding-choices"
              async
              src={`https://fundingchoicesmessages.google.com/i/${ADSENSE_CLIENT}?ers=1`}
              strategy="lazyOnload"
            />
            <Script id="google-funding-choices-signal" strategy="lazyOnload">{`
              (function(){function s(){if(!window.frames['googlefcPresent']){if(document.body){var i=document.createElement('iframe');i.style='width:0;height:0;border:none;z-index:-1000;left:-1000px;top:-1000px;';i.style.display='none';i.name='googlefcPresent';document.body.appendChild(i)}else{setTimeout(s,0)}}}s()})();
            `}</Script>
          </>
        )}
      </body>
    </html>
  );
}
