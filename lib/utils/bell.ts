"use client";

/**
 * A tiny Web Audio API "bell" chime used for in-app notification alerts.
 *
 * Why Web Audio instead of an audio file: no asset to ship or cache, works
 * offline, and the tone can be shaped precisely. Browsers require a user
 * gesture before audio can play, so the AudioContext is created lazily and
 * resumed on demand; if the browser blocks it we fail silently (never throw).
 */

let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    ctx ??= new Ctor();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/**
 * Plays a short two-tone bell. Safe to call repeatedly; each call schedules its
 * own oscillators and cleans them up when they finish.
 */
export function playBell(): void {
  const audio = getContext();
  if (!audio) return;

  const now = audio.currentTime;
  const master = audio.createGain();
  master.gain.setValueAtTime(0.0001, now);
  // Gentle attack/decay envelope so it rings like a bell, not a beep.
  master.gain.exponentialRampToValueAtTime(0.25, now + 0.02);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
  master.connect(audio.destination);

  // Two partials (a fundamental + a brighter fifth) for a pleasant chime.
  const tones = [
    { freq: 880, start: 0 },
    { freq: 1320, start: 0.12 },
  ];
  for (const { freq, start } of tones) {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now + start);
    gain.gain.exponentialRampToValueAtTime(0.6, now + start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + start + 0.7);
    osc.connect(gain).connect(master);
    osc.start(now + start);
    osc.stop(now + start + 0.8);
  }
}
