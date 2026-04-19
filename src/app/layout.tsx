import "./globals.css";
import type { Metadata, Viewport } from "next";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Allurahouse",
  description: "Allurahouse",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="min-h-[100dvh] overflow-x-clip">
      <body className="min-h-[100dvh]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

