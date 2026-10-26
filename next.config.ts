import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: isGitHubPages ? "export" : (process.env.VERCEL ? undefined : "standalone"),
  basePath: isGitHubPages ? basePath : "",
  assetPrefix: isGitHubPages ? basePath : "",
  trailingSlash: isGitHubPages,
  images: { unoptimized: true },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
