import createNextIntlPlugin from "next-intl/plugin";
import withBundleAnalyzerInit from "@next/bundle-analyzer";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
const withBundleAnalyzer = withBundleAnalyzerInit({ enabled: process.env.ANALYZE === "true" });

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Every ImageAsset/VideoAsset embedded on a CMS entity is served from
    // Cloudinary (see @kira-joo/toolkit-common's ImageAsset.secureUrl) —
    // this is the one remote host next/image is ever asked to optimize.
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
    // AVIF first, WebP fallback — Next defaults to WebP only. Matters most
    // for the hero's full-bleed local background (public/images/heroSection.png,
    // ~1.5MB source), which every visitor loads at `sizes="100vw"`.
    formats: ["image/avif", "image/webp"],
  },
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
