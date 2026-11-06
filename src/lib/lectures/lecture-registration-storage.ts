import { localStorageManager } from "@kira-joo/frontend-toolkit-core";

/**
 * A "this browser already registered" marker for the lectures gate — and
 * nothing more. It is NOT authentication and grants nothing: the audio is a
 * public static file and anyone can clear or set this key. Its only job is to
 * spare a returning visitor the form after their name and phone were already
 * recorded through the consultation-requests endpoint.
 *
 * Stores a timestamp only — never the name or phone.
 *
 * Every access is wrapped: `localStorage` throws (not just returns null) when
 * site data is blocked and in some private modes, and the toolkit manager does
 * not catch that. Unavailable storage degrades to "not registered", so the
 * visitor simply sees the form again; registration itself still works.
 */
export const LECTURE_REGISTRATION_STORAGE_KEY = "nutrition:lecture-registration";

export function hasLectureRegistration(): boolean {
  try {
    return localStorageManager.get<number>(LECTURE_REGISTRATION_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

export function rememberLectureRegistration(): void {
  try {
    localStorageManager.set(LECTURE_REGISTRATION_STORAGE_KEY, Date.now());
  } catch {
    // Storage unavailable — the unlock still applies for this visit.
  }
}
