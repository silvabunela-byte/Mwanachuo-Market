import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Mwanachuo Market — Soko la Wanachuo Tanzania",
  description: "Nunua na uuze vitabu, simu, laptop na vifaa vya chuo kwa wanachuo wenzako Tanzania.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sw">
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
