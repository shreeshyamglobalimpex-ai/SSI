"use client";

import { useEffect, useRef } from "react";
import { ADMIN_REFRESH_EVENT, type AdminAlert } from "@/lib/utils/notify";

/**
 * Re-runs `onRefresh` automatically:
 *  - immediately when any new admin notification is announced (same tab or
 *    another open tab polls and broadcasts),
 *  - on a fallback poll every `intervalMs` (catches status edits made in
 *    another tab/device),
 *  - when the tab becomes visible again after being hidden.
 *
 * Pass a stable callback (useCallback) to avoid re-subscribing. Polling is
 * skipped entirely while the tab is hidden to save requests.
 */
export function useAdminAutoRefresh(onRefresh: () => void, intervalMs = 15_000) {
  const cbRef = useRef(onRefresh);

  useEffect(() => {
    cbRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    const handler = (e: Event) => {
      // Ignore our own optimistic echoes — only refresh when a real new id arrives.
      const detail = (e as CustomEvent<AdminAlert>).detail;
      if (detail?.id) cbRef.current();
    };
    window.addEventListener(ADMIN_REFRESH_EVENT, handler);

    const onVisible = () => {
      if (document.visibilityState === "visible") cbRef.current();
    };
    document.addEventListener("visibilitychange", onVisible);

    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") cbRef.current();
    }, intervalMs);

    return () => {
      window.removeEventListener(ADMIN_REFRESH_EVENT, handler);
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(timer);
    };
  }, [intervalMs]);
}
