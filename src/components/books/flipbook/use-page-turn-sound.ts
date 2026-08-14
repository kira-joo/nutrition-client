"use client";
import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "book-reader-sound-enabled";

/**
 * A short, procedurally-generated "page turn" sound via the Web Audio
 * API — deliberately not an MP3/asset file: no licensed page-turn sound
 * ships in this repo, and fabricating one would mean committing binary
 * audio content with no real source. A brief filtered noise burst reads
 * as a paper-like "riffle" and costs zero bytes of asset weight.
 *
 * Defaults OFF (per the approved plan) and persists the visitor's choice
 * across sessions; always paired with a mute control, never autoplaying
 * without one.
 */
export function usePageTurnSound() {
  const [enabled, setEnabled] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "true") setEnabled(true);
  }, []);

  const toggle = useCallback(() => {
    setEnabled((current) => {
      const next = !current;
      window.localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const play = useCallback(() => {
    if (!enabled) return;
    try {
      const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const context = audioContextRef.current ?? new AudioContextClass();
      audioContextRef.current = context;

      const duration = 0.18;
      const bufferSize = Math.floor(context.sampleRate * duration);
      const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const decay = 1 - i / bufferSize;
        data[i] = (Math.random() * 2 - 1) * decay * decay;
      }

      const source = context.createBufferSource();
      source.buffer = buffer;

      const filter = context.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 800;

      const gain = context.createGain();
      gain.gain.value = 0.25;

      source.connect(filter);
      filter.connect(gain);
      gain.connect(context.destination);
      source.start();
    } catch {
      // Audio is a non-essential enhancement — never let a synthesis failure affect navigation.
    }
  }, [enabled]);

  return { enabled, toggle, play };
}
