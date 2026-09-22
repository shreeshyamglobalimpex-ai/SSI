import type { Metadata, Viewport } from "next";
import { siteMetadata } from "@/lib/seo";
import { SiteShell } from "@/components/layout/site-shell";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = siteMetadata;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#020617",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={4000}
        />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
