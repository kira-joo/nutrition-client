import { describe, expect, it } from "vitest";
import { formatMediaTime, toLatinDigits } from "./format";

describe("formatMediaTime", () => {
  it("formats under an hour as m:ss", () => {
    expect(formatMediaTime(0)).toBe("0:00");
    expect(formatMediaTime(65)).toBe("1:05");
    expect(formatMediaTime(22 * 60 + 9.9)).toBe("22:09");
  });

  it("switches to h:mm:ss at an hour", () => {
    expect(formatMediaTime(3921.13)).toBe("1:05:21");
  });

  it("uses the reference duration's shape for the current time", () => {
    expect(formatMediaTime(312, 3921)).toBe("0:05:12");
    expect(formatMediaTime(312, 1320)).toBe("5:12");
  });

  it("renders unknown or invalid values as 0:00", () => {
    expect(formatMediaTime(Number.NaN)).toBe("0:00");
    expect(formatMediaTime(Number.POSITIVE_INFINITY, Number.NaN)).toBe("0:00");
    expect(formatMediaTime(-4)).toBe("0:00");
  });
});

describe("toLatinDigits", () => {
  it("converts Arabic-Indic and extended Arabic-Indic digits", () => {
    expect(toLatinDigits("٠١٠٢٣٤٥٦٧٨٩")).toBe("01023456789");
    expect(toLatinDigits("۰۱۲۳۴۵۶۷۸۹")).toBe("0123456789");
  });

  it("leaves Latin digits and separators untouched", () => {
    expect(toLatinDigits("+20 10-1234")).toBe("+20 10-1234");
  });
});
