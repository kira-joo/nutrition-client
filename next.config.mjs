import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Every ImageAsset/VideoAsset embedded on a CMS entity is served from
    // Cloudinary (see @kira-joo/toolkit-common's ImageAsset.secureUrl) —
    // this is the one remote host next/image is ever asked to optimize.
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
};

export default withNextIntl(nextConfig);
