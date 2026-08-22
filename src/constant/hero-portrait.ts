/**
 * The hero's dedicated portrait cutout — supplied specifically for this
 * composition, not the CMS-managed `doctorProfile.avatar` used everywhere
 * else the doctor's photo appears (`doctor-preview-section.tsx`,
 * `doctor-intro-section.tsx`, `consultation-trust-panel.tsx`, all of which
 * stay on the CMS avatar, unchanged).
 *
 * Two different presentation contracts, not one asset reused badly:
 * `doctorProfile.avatar` is an arbitrary editor-uploaded rectangular photo,
 * always shown via `object-cover` inside a circle or rect because its shape
 * can't be assumed. This file is a pre-composed transparent cutout — real
 * alpha, verified by sampling the corners (0,0,0,0) — whose subject already
 * fills a ~0.79:1 box (measured from the alpha channel's bounding box:
 * 983×1246 of content in a 1254×1254 canvas), which is why it renders with
 * `object-contain` and no circular mask: cropping a cutout into a circle
 * would cut through the shoulders and crossed arms instead of respecting
 * the silhouette the asset already has.
 *
 * If the same photo should become the doctor's one canonical CMS photo
 * (replacing the existing 731×1280 Cloudinary avatar everywhere), that is a
 * content update made through the real nutrition-staff editor flow, not a
 * code change here.
 */
export const HERO_PORTRAIT_SRC = "/images/doctor.png";
