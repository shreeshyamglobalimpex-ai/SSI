"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, BellRing } from "lucide-react";
import clsx from "clsx";
import { playBell } from "@/lib/utils/bell";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

const POLL_MS = 20_000;

/**
 * Live notification bell for the admin header.
 *
 * Polls the notifications endpoint and, when a brand-new alert arrives, plays a
 * bell chime and fires a desktop/browser push notification with the details.
 * Shows an unread badge and links to the full notifications page. Degrades
 * gracefully: if the browser blocks notifications or audio, the in-app badge
 * and chime-on-next-gesture still work.
 */
export function NotificationBell() {
  const [unread, setUnread] = useState(0);
  const [latest, setLatest] = useState<Notification | null>(null);
  const [pulse, setPulse] = useState(false);

  // Highest id we've already alerted on, so we never re-chime for old alerts.
  const seenIdRef = useRef<string | null>(null);
  const permissionAskedRef = useRef(false);

  const requestPermission = useCallback(() => {
    if (permissionAskedRef.current) return;
    permissionAskedRef.current = true;
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        void Notification.requestPermission();
      }
    }
  }, []);

  const showPush = useCallback((n: Notification) => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    try {
      new Notification(n.title, {
        body: n.message,
        icon: "/logo.webp",
        tag: n.id,
      });
    } catch {
      // Some browsers throw if not constructed in a service worker — ignore.
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function poll() {
      try {
        const res = await fetch("/api/admin/notifications", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = await res.json();
        if (!active || !json?.success) return;

        const items: Notification[] = json.data ?? [];
        const nextUnread: number = json.unread ?? 0;
        const top = items[0] ?? null;

        // First load primes the baseline without making noise.
        if (seenIdRef.current === null) {
          seenIdRef.current = top?.id ?? "";
        } else if (top && top.id !== seenIdRef.current && !top.read) {
          // A genuinely new, unread alert arrived → chime + push.
          seenIdRef.current = top.id;
          playBell();
          showPush(top);
          setLatest(top);
          setPulse(true);
          window.setTimeout(() => setPulse(false), 2500);
        }

        setUnread(nextUnread);
      } catch {
        // Silent — transient network/poll errors shouldn't disrupt the admin.
      }
    }

    void poll();
    const timer = window.setInterval(poll, POLL_MS);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [showPush]);

  const hasUnread = unread > 0;

  return (
    <Link
      href="/admin/notifications"
      onClick={requestPermission}
      title={
        latest
          ? `Latest: ${latest.title}`
          : hasUnread
            ? `${unread} unread notification${unread > 1 ? "s" : ""}`
            : "Notifications"
      }
      aria-label={
        hasUnread
          ? `Notifications, ${unread} unread`
          : "Notifications, none unread"
      }
      className="relative grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
    >
      {pulse ? (
        <BellRing className="size-5 animate-pulse text-emerald-600" />
      ) : (
        <Bell
          className={clsx("size-5", hasUnread && "text-emerald-700")}
        />
      )}

      {hasUnread && (
        <span
          className={clsx(
            "absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-rose-600 px-1 text-[11px] font-bold leading-5 text-white ring-2 ring-white",
            pulse && "animate-bounce",
          )}
        >
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
