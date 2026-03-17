import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kalshi BotOS",
  description: "Wire ChatGPT OAuth to a Kalshi sandbox workflow for strategy testing, market review, and manual operator approval.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="app-shell terminal-shell">
          <Header />
          <main className="px-0 pb-16 pt-2 md:px-0 md:pb-10">
            <div className="system-shell">{children}</div>
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
