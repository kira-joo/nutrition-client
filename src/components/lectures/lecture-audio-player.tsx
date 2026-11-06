"use client";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Pause, Play, RotateCcw, RotateCw, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatMediaTime } from "@/lib/lectures/format";

const SKIP_SECONDS = 15;
const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 1.75, 2] as const;
const SEEK_STEP_SECONDS = 5;

const ROUND_CONTROL =
  "inline-flex shrink-0 items-center justify-center rounded-full transition-[color,background-color,box-shadow] duration-base ease-standard disabled:cursor-not-allowed disabled:opacity-50";

/**
 * iOS Safari ignores `HTMLMediaElement.volume` (hardware buttons own volume
 * there) and reads it back unchanged. Probe once, so the slider is only
 * offered where it actually does something; mute works everywhere.
 */
let volumeAdjustableCache: boolean | undefined;
function canSetVolume(): boolean {
  if (volumeAdjustableCache === undefined) {
    try {
      const probe = document.createElement("audio");
      probe.volume = 0.5;
      volumeAdjustableCache = probe.volume === 0.5;
    } catch {
      volumeAdjustableCache = false;
    }
  }
  return volumeAdjustableCache;
}
const noopSubscribe = () => () => {};
const serverCannotSetVolume = () => false;

export interface LectureAudioPlayerProps {
  src: string;
  title: string;
}

/**
 * A custom player over a hidden, control-less `<audio>`: the native controls
 * are what expose "Download" (Chrome's overflow menu) and "Save audio as…"
 * (the media context menu), so neither is rendered. This is a deterrent, not
 * protection — the browser still fetches the file to play it, and anyone with
 * dev tools can retrieve it.
 *
 * `preload="metadata"` fetches only enough to learn the duration; the ~22 MB
 * body streams via range requests once playback starts.
 */
export function LectureAudioPlayer({ src, title }: LectureAudioPlayerProps) {
  const t = useTranslations("lectures.player");
  const audioRef = useRef<HTMLAudioElement>(null);

  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(Number.NaN);
  const [currentTime, setCurrentTime] = useState(0);
  const [buffering, setBuffering] = useState(false);
  const [failed, setFailed] = useState(false);
  const [rate, setRate] = useState<number>(1);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const volumeAdjustable = useSyncExternalStore(noopSubscribe, canSetVolume, serverCannotSetVolume);
  /** Thumb position while a pointer drag is in progress — committed to the media on release, so a drag doesn't issue a seek per pixel. */
  const [scrubTime, setScrubTime] = useState<number | null>(null);

  const ready = Number.isFinite(duration) && duration > 0;

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      // A rejected play() (e.g. a source error) surfaces through the
      // element's own `error` event; nothing extra to report here.
      void audio.play().catch(() => undefined);
    } else {
      audio.pause();
    }
  }, []);

  const seekTo = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = Math.min(Math.max(seconds, 0), audio.duration);
    setCurrentTime(audio.currentTime);
  }, []);

  const skip = useCallback(
    (delta: number) => {
      const audio = audioRef.current;
      if (audio) seekTo(audio.currentTime + delta);
    },
    [seekTo],
  );

  // Lock-screen / notification controls on mobile — this is a long lecture
  // that people will listen to with the screen off.
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    const session = navigator.mediaSession;
    try {
      session.metadata = new MediaMetadata({ title });
      session.setActionHandler("play", () => void audioRef.current?.play().catch(() => undefined));
      session.setActionHandler("pause", () => audioRef.current?.pause());
      session.setActionHandler("seekbackward", () => skip(-SKIP_SECONDS));
      session.setActionHandler("seekforward", () => skip(SKIP_SECONDS));
      session.setActionHandler("seekto", (details) => {
        if (details.seekTime !== undefined) seekTo(details.seekTime);
      });
    } catch {
      // Partial Media Session support — the on-page controls are unaffected.
    }
    return () => {
      try {
        session.metadata = null;
        for (const action of ["play", "pause", "seekbackward", "seekforward", "seekto"] as const) {
          session.setActionHandler(action, null);
        }
      } catch {
        // ignore
      }
    };
  }, [title, skip, seekTo]);

  function onSeekChange(event: ChangeEvent<HTMLInputElement>) {
    const value = Number(event.target.value);
    if (scrubTime !== null) {
      setScrubTime(value);
    } else {
      seekTo(value);
    }
  }

  function commitScrub() {
    if (scrubTime === null) return;
    seekTo(scrubTime);
    setScrubTime(null);
  }

  function onRateChange(event: ChangeEvent<HTMLSelectElement>) {
    const next = Number(event.target.value);
    setRate(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  }

  function onVolumeChange(event: ChangeEvent<HTMLInputElement>) {
    const next = Number(event.target.value);
    const audio = audioRef.current;
    setVolume(next);
    if (!audio) return;
    audio.volume = next;
    audio.muted = next === 0;
  }

  function toggleMute() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    if (!audio.muted && audio.volume === 0) {
      audio.volume = 1;
      setVolume(1);
    }
  }

  function retry() {
    setFailed(false);
    audioRef.current?.load();
  }

  const shownTime = scrubTime ?? currentTime;
  const elapsedLabel = formatMediaTime(shownTime, duration);
  const durationLabel = ready ? formatMediaTime(duration) : "--:--";

  return (
    <section
      aria-label={t("regionLabel")}
      className="rounded-xl border-hairline border-border bg-surface p-5 shadow-md sm:p-8"
    >
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        controlsList="nodownload"
        onContextMenu={(event) => event.preventDefault()}
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration);
          event.currentTarget.playbackRate = rate;
        }}
        onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onCanPlay={() => setBuffering(false)}
        onVolumeChange={(event) => setMuted(event.currentTarget.muted)}
        onError={() => {
          setFailed(true);
          setPlaying(false);
          setBuffering(false);
        }}
        className="hidden"
      />

      {failed ? (
        <div role="alert" className="flex flex-col items-center gap-4 py-6 text-center">
          <p className="text-body text-text-primary">{t("error")}</p>
          <button
            type="button"
            onClick={retry}
            className="h-control-md rounded-full border-hairline border-border bg-surface px-6 text-button font-semibold text-text-primary pointer:hover:border-primary pointer:hover:text-primary"
          >
            {t("retry")}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Transport. DOM order back → play → forward; in RTL the row mirrors, so "back" sits on the side the timeline starts from. */}
          <div className="flex items-center justify-center gap-5 sm:gap-8">
            <button
              type="button"
              onClick={() => skip(-SKIP_SECONDS)}
              disabled={!ready}
              aria-label={t("back")}
              className={cn(
                ROUND_CONTROL,
                "relative h-12 w-12 text-text-secondary pointer:hover:bg-primary-soft pointer:hover:text-primary",
              )}
            >
              <RotateCcw aria-hidden="true" className="h-icon-lg w-icon-lg" />
              <span aria-hidden="true" className="absolute text-caption font-bold tabular-nums">
                15
              </span>
            </button>

            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? t("pause") : t("play")}
              className={cn(
                ROUND_CONTROL,
                "focus-ring-on-dark h-16 w-16 bg-primary text-white shadow-md pointer:hover:bg-primary-hover pointer:hover:shadow-raised sm:h-20 sm:w-20",
              )}
            >
              {buffering && playing ? (
                <Loader2 aria-hidden="true" className="h-icon-xl w-icon-xl animate-spin motion-reduce:animate-none" />
              ) : playing ? (
                <Pause aria-hidden="true" className="h-icon-xl w-icon-xl" fill="currentColor" />
              ) : (
                // Play glyphs point "forward in time"; that stays rightward
                // in RTL too, matching every platform media control.
                <Play aria-hidden="true" className="h-icon-xl w-icon-xl translate-x-0.5" fill="currentColor" />
              )}
            </button>

            <button
              type="button"
              onClick={() => skip(SKIP_SECONDS)}
              disabled={!ready}
              aria-label={t("forward")}
              className={cn(
                ROUND_CONTROL,
                "relative h-12 w-12 text-text-secondary pointer:hover:bg-primary-soft pointer:hover:text-primary",
              )}
            >
              <RotateCw aria-hidden="true" className="h-icon-lg w-icon-lg" />
              <span aria-hidden="true" className="absolute text-caption font-bold tabular-nums">
                15
              </span>
            </button>
          </div>

          {/* Timeline */}
          <div className="flex flex-col gap-1">
            <input
              type="range"
              min={0}
              max={ready ? duration : 0}
              step={SEEK_STEP_SECONDS}
              value={ready ? Math.min(shownTime, duration) : 0}
              disabled={!ready}
              onChange={onSeekChange}
              onPointerDown={() => setScrubTime(currentTime)}
              onPointerUp={commitScrub}
              onPointerCancel={commitScrub}
              onBlur={commitScrub}
              aria-label={t("seek")}
              aria-valuetext={t("position", { current: elapsedLabel, total: durationLabel })}
              className="h-11 w-full cursor-pointer accent-primary disabled:cursor-not-allowed"
            />
            <div className="flex items-center justify-between text-label font-medium text-text-secondary tabular-nums">
              <span dir="ltr">
                <span className="sr-only">{t("elapsed")} </span>
                {elapsedLabel}
              </span>
              <span dir="ltr">
                <span className="sr-only">{t("duration")} </span>
                {durationLabel}
              </span>
            </div>
            {!ready && (
              <p role="status" className="text-center text-label text-text-secondary">
                {t("loading")}
              </p>
            )}
          </div>

          {/* Secondary controls */}
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t-hairline border-border pt-5">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? t("unmute") : t("mute")}
                aria-pressed={muted}
                className={cn(
                  ROUND_CONTROL,
                  "h-11 w-11 text-text-secondary pointer:hover:bg-primary-soft pointer:hover:text-primary",
                )}
              >
                {muted || volume === 0 ? (
                  <VolumeX aria-hidden="true" className="h-icon-md w-icon-md rtl:-scale-x-100" />
                ) : (
                  <Volume2 aria-hidden="true" className="h-icon-md w-icon-md rtl:-scale-x-100" />
                )}
              </button>
              {volumeAdjustable && (
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={muted ? 0 : volume}
                  onChange={onVolumeChange}
                  aria-label={t("volume")}
                  aria-valuetext={`${Math.round((muted ? 0 : volume) * 100)}%`}
                  className="h-11 w-28 cursor-pointer accent-primary sm:w-32"
                />
              )}
            </div>

            <label className="flex items-center gap-2 text-label font-medium text-text-secondary">
              <span className="sr-only sm:not-sr-only">{t("speed")}</span>
              <select
                value={rate}
                onChange={onRateChange}
                dir="ltr"
                className="h-11 cursor-pointer rounded-full border-hairline border-border bg-surface px-4 text-body-sm font-semibold text-text-primary tabular-nums pointer:hover:border-primary"
              >
                {PLAYBACK_RATES.map((option) => (
                  <option key={option} value={option}>
                    {option}×
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      )}
    </section>
  );
}
