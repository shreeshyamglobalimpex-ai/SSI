"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, BellRing } from "lucide-react";
import { toast } from "sonner";
import clsx from "clsx";
import {
  announceAdminAlert,
  onCrossTabAlert,
  requestNotificationPermission,
  startTabAlert,
  stopTabAlert,
  type AdminAlert,
} from "@/lib/utils/notify";
import { unlockAudio, playBell } from "@/lib/utils/bell";

const POLL_VISIBLE_MS = 20_000;
const POLL_HIDDEN_MS = 60_000;

/**
 * Live notification bell for the admin header — polls for new alerts,
 * chimes + pushes + toasts, and broadcasts a refresh event so every
 * open admin list updates without manual reload.
 */
export function NotificationBell() {
  const [unread, setUnread] = useState(0);
  const [latest, setLatest] = useState<AdminAlert | null>(null);
  const [pulse, setPulse] = useState(false);
  const seenRef = useRef<Set<string> | null>(null);
  const primedRef = useRef(false);
  const unlockedRef = useRef(false);

  const getSeen = useCallback(() => {
    if (seenRef.current) return seenRef.current;
    const s = new Set<string>();
    try {
      const raw = localStorage.getItem("ssi-seen-notifs");
      if (raw) (JSON.parse(raw) as string[]).forEach((id) => s.add(id));
    } catch { /* start fresh */ }
    seenRef.current = s;
    return s;
  }, []);

  const remember = useCallback((id: string) => {
    const s = getSeen();
    s.add(id);
    const arr = Array.from(s).slice(-100);
    seenRef.current = new Set(arr);
    try { localStorage.setItem("ssi-seen-notifs", JSON.stringify(arr)); } catch { /* ignore */ }
  }, [getSeen]);

  // Central handler for a genuinely new alert: badge + chime/toast (only if
  // this tab is visible — hidden tabs stay quiet but still blink) + tab blink
  // + fan-out so lists refresh.
  const handleFresh = useCallback((n: AdminAlert, unreadCount: number) => {
    const seen = getSeen();
    if (seen.has(n.id)) return;
    remember(n.id);
    setLatest(n);
    setUnread(unreadCount);
    if (document.visibilityState === "visible") {
      announceAdminAlert(n);
    } else {
      // Background tab: silent (no toast/chime duplication) but still a
      // browser popup + cross-tab fan-out. Chime attempt is harmless —
      // blocked audio just no-ops until next gesture unlocks it.
      playBell();
      announceAdminAlert(n, { silent: true });
    }
    startTabAlert(unreadCount);
    setPulse(true);
    window.setTimeout(() => setPulse(false), 2500);
  }, [remember, getSeen]);

  const unlock = useCallback(() => {
    if (!unlockedRef.current) {
      unlockedRef.current = true;
      unlockAudio();
      if ("Notification" in window && Notification.permission === "default") {
        void requestNotificationPermission().then((p) => {
          if (p === "granted") toast.success("Notifications on — you'll hear new entries.");
          else if (p === "denied") toast.warning("Notifications blocked — allow them in site settings.");
        });
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [unlock]);

  useEffect(() => {
    let active = true;
    let timer: number | null = null;

    async function poll() {
      try {
        // Cheap ping: count + newest row only (~50–150ms), not the full list.
        const res = await fetch("/api/admin/notifications?mode=ping", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (!active || !json?.success) return;
        const nextUnread: number = json.unread ?? 0;
        const top: AdminAlert | null = json.latest ?? json.data?.[0] ?? null;
        setUnread(nextUnread);

        // Red dot gone rule: no unread left → restore tab immediately.
        if (nextUnread === 0) {
          stopTabAlert();
          setPulse(false);
        }

        if (!primedRef.current) {
          primedRef.current = true;
          if (top) remember(top.id);
          window.setTimeout(() => {
            if (active && "Notification" in window && Notification.permission === "default") {
              toast.info("Enable browser notifications?", {
                description: "Get popup + sound for every new inquiry — even in another tab.",
                action: { label: "Enable", onClick: () => { void requestNotificationPermission(); } },
                duration: 8000,
              });
            }
          }, 2500);
          return;
        }
        if (top && !top.read) handleFresh(top, nextUnread);
      } catch { /* silent */ }
      finally {
        // Adaptive cadence: fast when visible, slow when hidden (saves DB).
        if (active) {
          const next = document.visibilityState === "visible" ? POLL_VISIBLE_MS : POLL_HIDDEN_MS;
          timer = window.setTimeout(poll, next);
        }
      }
    }

    // Alerts found by ANOTHER tab's poll → chime/blink here too, even hidden.
    const offCrossTab = onCrossTabAlert((n) => {
      if (!active) return;
      setUnread((u) => {
        const next = u + 1;
        handleFresh(n, next);
        return next;
      });
    });

    // Coming back to this tab (or opening notifications) clears the blink.
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        stopTabAlert();
        void poll();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    void poll();
    return () => {
      active = false;
      if (timer !== null) window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
      offCrossTab();
    };
  }, [handleFresh, remember]);

  const hasUnread = unread > 0;

  return (
    <Link
      href="/admin/notifications"
      onClick={unlock}
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
