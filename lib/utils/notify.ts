"use client";

import { toast } from "sonner";
import { playBell } from "@/lib/utils/bell";

export type AdminAlert = {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

/** Event fired on `window` whenever a brand-new admin notification arrives. */
export const ADMIN_REFRESH_EVENT = "ssi:admin-refresh";

/** Cross-tab channel so a poll in ANY tab alerts EVERY open admin tab. */
const CHANNEL_NAME = "ssi-admin-alerts";

function broadcastAlert(n: AdminAlert): void {
  try {
    const bc = new BroadcastChannel(CHANNEL_NAME);
    bc.postMessage({ kind: "new-alert", alert: n });
    bc.close();
  } catch {
    // BroadcastChannel unsupported (old browser) — same-tab event still works.
  }
  try {
    // Storage-event fallback: fires in every OTHER tab.
    localStorage.setItem(
      "ssi-alert-broadcast",
      JSON.stringify({ id: n.id, at: Date.now(), alert: n }),
    );
  } catch {
    // Storage blocked — same-tab event still works.
  }
}

/** Subscribe to alerts announced from other tabs. Returns unsubscribe fn. */
export function onCrossTabAlert(cb: (n: AdminAlert) => void): () => void {
  const cleanups: Array<() => void> = [];

  try {
    const bc = new BroadcastChannel(CHANNEL_NAME);
    const handler = (e: MessageEvent) => {
      const alert = (e.data as { kind?: string; alert?: AdminAlert } | null)?.alert;
      if (e.data?.kind === "new-alert" && alert?.id) cb(alert);
    };
    bc.addEventListener("message", handler);
    cleanups.push(() => bc.close());
  } catch {
    // Fall through to storage fallback.
  }

  const onStorage = (e: StorageEvent) => {
    if (e.key !== "ssi-alert-broadcast" || !e.newValue) return;
    try {
      const parsed = JSON.parse(e.newValue) as { alert?: AdminAlert };
      if (parsed.alert?.id) cb(parsed.alert);
    } catch {
      // Ignore malformed payloads.
    }
  };
  window.addEventListener("storage", onStorage);
  cleanups.push(() => window.removeEventListener("storage", onStorage));

  return () => cleanups.forEach((fn) => fn());
}

/* ── Blinking red-dot favicon + title ─────────────────────────────── */

const ORIGINAL_TITLE = typeof document !== "undefined" ? document.title : "";
let blinkTimer: number | null = null;
let dotVisible = false;
let baseFavicon: string | null = null;

function getBaseFavicon(): string {
  if (baseFavicon) return baseFavicon;
  const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  baseFavicon = link?.href ?? "/favicon.ico";
  return baseFavicon;
}

function redDotFavicon(): string {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  if (!ctx) return getBaseFavicon();
  // Bell-ish rounded square base so it still looks like the app icon.
  ctx.fillStyle = "#0f766e";
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, 14);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 34px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("!", size / 2, size / 2 + 2);
  // Red dot, top-right.
  ctx.beginPath();
  ctx.arc(size - 12, 12, 11, 0, Math.PI * 2);
  ctx.fillStyle = "#ef4444";
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();
  return c.toDataURL("image/png");
}

function applyFavicon(href: string): void {
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = href;
}

/** Start blinking the tab: (● red dot) title + red-dot favicon. */
export function startTabAlert(unread: number): void {
  if (typeof document === "undefined") return;
  stopTabAlert(true);
  const label = unread > 0 ? `(${unread}) New alert` : "New alert";
  const dotty = redDotFavicon();
  const plain = getBaseFavicon();
  blinkTimer = window.setInterval(() => {
    dotVisible = !dotVisible;
    document.title = dotVisible ? `🔴 ${label} — SSI Admin` : ORIGINAL_TITLE;
    applyFavicon(dotVisible ? dotty : plain);
  }, 800);
}

/** Stop blinking and restore the original title + favicon. */
export function stopTabAlert(silent = false): void {
  if (typeof document === "undefined") return;
  if (blinkTimer !== null) {
    window.clearInterval(blinkTimer);
    blinkTimer = null;
  }
  if (!silent) {
    document.title = ORIGINAL_TITLE;
    applyFavicon(getBaseFavicon());
    dotVisible = false;
  }
}

/** Ask the browser for desktop-notification permission. Must be called from a user gesture. */
export async function requestNotificationPermission(): Promise<NotificationPermission | null> {
  if (typeof window === "undefined" || !("Notification" in window)) return null;
  try {
    if (Notification.permission === "granted" || Notification.permission === "denied") {
      return Notification.permission;
    }
    return await Notification.requestPermission();
  } catch {
    return null;
  }
}

/** Fire a native OS/browser notification. No-op unless permission was granted. */
export function showBrowserNotification(n: AdminAlert): void {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    const notif = new Notification(n.title, {
      body: n.message.slice(0, 180),
      icon: "/logo.webp",
      tag: n.id,
    });
    notif.onclick = () => {
      window.focus();
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/admin/notifications";
      notif.close();
    };
  } catch {
    // Some browsers only allow `new Notification` inside a service worker — ignore.
  }
}

/**
 * The full "new entry" fan-out: bell chime + in-app toast + browser
 * notification + a window event so every open admin list auto-refreshes
 * without a manual reload.
 */
export function announceAdminAlert(n: AdminAlert, opts?: { silent?: boolean }): void {
  if (!opts?.silent) {
    playBell();

    toast.info(n.title, {
      description: n.message.slice(0, 140),
      // Toast action runs outside React render — plain href nav is intentional.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      action: { label: "View", onClick: () => (window.location.href = "/admin/notifications") },
      duration: 6000,
    });
  }

  // Browser popup works even when this tab is in the background — as long as
  // permission was granted earlier and the browser is running.
  showBrowserNotification(n);

  // Tell every other open admin tab (they chime + blink even if hidden).
  broadcastAlert(n);

  window.dispatchEvent(new CustomEvent<AdminAlert>(ADMIN_REFRESH_EVENT, { detail: n }));
}
