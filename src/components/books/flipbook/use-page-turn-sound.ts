"use client";
import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "book-reader-sound-enabled";
const SOUND_URL = "/sounds/flip.mp3";

/**
 * The mute toggle exists, persists, and works. `play()` uses a real,
 * user-provided page-turn recording (`public/sounds/flip.mp3`) — an
 * earlier version synthesized a noise burst via the Web Audio API, which
 * read as artificial rather than paper-like and was explicitly rejected;
 * sourcing a replacement from the internet was also off the table, so
 * sound shipped disabled-by-default until this real asset was supplied.
 * One `Audio` element is reused across calls (rather than constructing a
 * new one per turn) and rewound before each play so rapid page turns
 * retrigger cleanly instead of queuing.
 */
export function usePageTurnSound() {
  const [enabled, setEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "true") setEnabled(true);
    audioRef.current = new Audio(SOUND_URL);
  }, []);

  const toggle = useCallback(() => {
    setEnabled((current) => {
      const next = !current;
      window.localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !enabled) return;
    audio.currentTime = 0;
    // Browsers reject play() when it can't start immediately (e.g. no
    // prior user gesture yet on this page) — that's a normal, silent
    // no-op here, not an error worth surfacing.
    void audio.play().catch(() => {});
  }, [enabled]);

  return { enabled, toggle, play };
}
