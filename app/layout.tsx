import type { Metadata } from "next";
import { Almarai } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ClientLayout from "./components/ClientLayout";
import Footer from "./components/Footer";
import { getCachedCompany } from "./lib/products-cache";

const almarai = Almarai({ subsets: ["arabic"], weight: ["400", "700", "800"], display: "swap" });

const SITE_URL = "https://www.albiladksa.com";

export async function generateMetadata(): Promise<Metadata> {
  const c = await getCachedCompany();

  const siteName = c.nameAr || "مؤسسة البلاد الحديثة للإلكترونيات";
  const description = c.details || "مؤسسة البلاد الحديثة للإلكترونيات - أجهزة إلكترونية بالأقساط داخل المملكة العربية السعودية. أفضل الأسعار على الجوالات، اللابتوبات، الأجهزة اللوحية والإكسسوارات.";

  const logoUrl = c.logo
    ? (c.logo.startsWith("http") ? c.logo : `${SITE_URL}${c.logo}`)
    : `${SITE_URL}/android-chrome-512x512.png`;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description,
    keywords: [
      siteName,
      c.nameEn || "Al Bilad Modern Electronics",
      "البلاد", "البلاد الحديثة", "أقساط", "جوالات", "لابتوب", "أجهزة إلكترونية",
      "سامسونج", "آبل", "أيفون", "شاومي",
      "السعودية", "الرياض", "جدة",
    ],
    authors: [{ name: siteName, url: SITE_URL }],
    creator: siteName,
    publisher: siteName,
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    icons: {
      icon: [
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon.ico" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
      other: [
        { rel: "android-chrome-192x192", url: "/android-chrome-192x192.png" },
        { rel: "android-chrome-512x512", url: "/android-chrome-512x512.png" },
      ],
    },
    manifest: "/site.webmanifest",
    openGraph: {
      type: "website",
      locale: "ar_SA",
      url: SITE_URL,
      siteName,
      title: siteName,
      description,
      images: [
        {
          url: logoUrl,
          width: 1200,
          height: 630,
          alt: siteName,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description,
      images: [{ url: logoUrl, alt: siteName }],
    },
    alternates: {
      canonical: SITE_URL,
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || "",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const company = await getCachedCompany();

  return (
    <html lang="ar" dir="rtl">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18394753580"
          strategy="lazyOnload"
        />
        <Script id="gtag-init" strategy="lazyOnload">
          {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'AW-18394753580');`}
        </Script>
        <Script id="tiktok-pixel" strategy="lazyOnload">
          {`!function (w, d, t) {
            w.TiktokAnalyticsObject=t;
            var ttq=w[t]=w[t]||[];
            ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
            ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
            for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
            ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
            ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript";n.async=!0;n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
            ttq.load('DACR6JRC77UDHLL3EU0G');
            ttq.page();
          }(window, document, 'ttq');`}
        </Script>
      </head>
      <body className={`antialiased ${almarai.className}`} suppressHydrationWarning>
        <ClientLayout company={company} footer={<Footer />}>{children}</ClientLayout>
      </body>
    </html>
  );
}
