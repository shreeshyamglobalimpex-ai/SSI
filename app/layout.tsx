import type { Metadata, Viewport } from "next";
import { siteMetadata } from "@/lib/seo";
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
      <head>
        <script
          id="vtag-ai-js"
          async
          src="https://r2.leadsy.ai/tag.js"
          data-pid="1hW4lIk7DFqzQMmyM"
          data-version="062024"
        ></script>
        <script
          id="vtag-ai-js"
          async
          src="https://r2.leadsy.ai/tag.js?pid=1hW4lIk7DFqzQMmyM&version=062024"
        ></script>
      </head>
      <body>
        <Toaster position="top-right" richColors closeButton duration={4000} />
        {children}
      </body>
    </html>
  );
}
