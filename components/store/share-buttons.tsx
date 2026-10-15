"use client";
import { useCallback, useState } from "react";
import {
  Link2,
  Share2,
  Check,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Product sharing controls.
 *
 * Uses the Web Share API when available (native sheet on mobile/modern
 * browsers) and otherwise falls back to explicit buttons: copy link, WhatsApp,
 * Facebook, X/Twitter, LinkedIn and email.
 */
export function ShareButtons({
  url,
  title,
  description,
}: {
  url: string;
  title: string;
  description?: string;
}) {
  const [copied, setCopied] = useState(false);

  // `navigator.share` is only present in secure contexts on capable browsers.
  // It is stable for the session, so it is safe to read during render on the
  // client (no effect needed — avoids a needless re-render).
  const canNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  const shareText = description ? `${title} — ${description}` : title;

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  }, [url]);

  const nativeShare = useCallback(async () => {
    try {
      await navigator.share({ title, text: shareText, url });
    } catch {
      // User dismissed the share sheet — nothing to do.
    }
  }, [title, shareText, url]);

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(shareText);

  const links = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      icon: MessageCircle,
      className: "hover:border-emerald-300 hover:text-emerald-700",
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: Facebook,
      className: "hover:border-blue-300 hover:text-blue-600",
    },
    {
      label: "X (Twitter)",
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      icon: Twitter,
      className: "hover:border-slate-400 hover:text-slate-900",
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: Linkedin,
      className: "hover:border-sky-300 hover:text-sky-700",
    },
    {
      label: "Email",
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodedText}%20${encodedUrl}`,
      icon: Mail,
      className: "hover:border-emerald-300 hover:text-emerald-700",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm font-medium text-slate-500">Share</span>

      <button
        type="button"
        onClick={copyLink}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        aria-label="Copy link"
      >
        {copied ? (
          <Check className="size-4 text-emerald-600" />
        ) : (
          <Link2 className="size-4" />
        )}
        {copied ? "Copied" : "Copy link"}
      </button>

      {canNativeShare && (
        <button
          type="button"
          onClick={nativeShare}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-slate-900 px-3 text-sm font-medium text-white transition hover:bg-emerald-700"
          aria-label="Share"
        >
          <Share2 className="size-4" /> Share
        </button>
      )}

      {links.map(({ label, href, icon: Icon, className }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${label}`}
          className={`grid size-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition ${className}`}
        >
          <Icon className="size-4" />
        </a>
      ))}
    </div>
  );
}
