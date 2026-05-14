import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing, type AppLocale } from "@/i18n/routing";
import "../../globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
});

const SITE = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "Rise Up Together", template: "%s · Rise Up Together" },
  description: "Charity supporting community through football and solidarity.",
  openGraph: {
    siteName: "Rise Up Together",
    type: "website",
    images: ["/logo.jpg"],
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/logo.jpg" },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as AppLocale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
