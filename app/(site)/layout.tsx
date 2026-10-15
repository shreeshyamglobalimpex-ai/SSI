import { SiteShell } from "@/components/layout/site-shell";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <SiteShell>{children}</SiteShell>;
}