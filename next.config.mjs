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
  },
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
