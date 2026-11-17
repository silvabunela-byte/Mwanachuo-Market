import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mwanachuo Market - Soko la Wanachuo Tanzania",
  description:
    "Nunua na uza bidhaa, huduma, vyumba na hosteli karibu na chuo chako. Wasiliana na muuzaji moja kwa moja kupitia WhatsApp.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sw">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
