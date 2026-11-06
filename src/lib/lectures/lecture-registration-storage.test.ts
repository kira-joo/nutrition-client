import { afterEach, describe, expect, it, vi } from "vitest";
import {
  LECTURE_REGISTRATION_STORAGE_KEY,
  hasLectureRegistration,
  rememberLectureRegistration,
} from "./lecture-registration-storage";

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe("lecture registration storage", () => {
  it("is unset for a new browser and set after remembering", () => {
    expect(hasLectureRegistration()).toBe(false);
    rememberLectureRegistration();
    expect(hasLectureRegistration()).toBe(true);
  });

  it("stores only a timestamp — never the visitor's details", () => {
    rememberLectureRegistration();
    const raw = window.localStorage.getItem(LECTURE_REGISTRATION_STORAGE_KEY);
    expect(raw).toMatch(/^\d+$/);
  });

  it("treats throwing storage as not registered, and remembering as a silent no-op", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    expect(() => rememberLectureRegistration()).not.toThrow();
    expect(hasLectureRegistration()).toBe(false);
  });
});
