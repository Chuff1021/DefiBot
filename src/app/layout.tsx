import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DefiBot Research Terminal",
  description: "Chart-first DeFi paper trading and backtesting platform research shell.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
