import QRCode from "qrcode";

/**
 * Hand-synced from nutrition-staff's
 * `src/server/books/render/qr/generate-qr-svg.ts` — real, deterministic
 * QR generation (same `qrcode` package, same options), used for both the
 * book/template QR on the back cover and any block-level `QR_LINK`.
 * Runs client-side here (in the visitor's own browser, as part of
 * building the paginated page HTML) rather than server-side, but the
 * output is byte-identical given the same destination string. `width`/
 * `height` attributes the library would otherwise emit are stripped so
 * the surrounding CSS class controls physical size in mm, exactly like
 * every other sized element in the template.
 */
const FIXED_DIMENSION_ATTRS = /\s(width|height)="[^"]*"/g;

export async function generateQrSvg(destination: string): Promise<string> {
  const svg = await QRCode.toString(destination, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 1,
    color: { dark: "#1c1c1c", light: "#ffffff" },
  });
  return svg.replace(FIXED_DIMENSION_ATTRS, "");
}
