"use client";
import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "book-reader-sound-enabled";
const SOUND_URL = "/sounds/flip.mp3";

/**
 * Enabled by default, with the mute toggle persisting an explicit opt-out. `play()` uses a real,
 * user-provided page-turn recording (`public/sounds/flip.mp3`) — an
 * earlier version synthesized a noise burst via the Web Audio API, which
 * read as artificial rather than paper-like and was explicitly rejected;
 * sourcing a replacement from the internet was also off the table.
 * One `Audio` element is reused across calls (rather than constructing a
 * new one per turn) and rewound before each play so rapid page turns
 * retrigger cleanly instead of queuing.
 */
export function usePageTurnSound() {
  const [enabled, setEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Default ON: only an explicit opt-out turns it off, so a first-time
    // visitor hears the page turn. Read in an effect (not a lazy
    // initializer) because localStorage does not exist during SSR, and
    // `false` stays the pre-mount value so server and client markup match.
    const stored = window.localStorage.getItem(STORAGE_KEY);
    setEnabled(stored !== "false");
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
