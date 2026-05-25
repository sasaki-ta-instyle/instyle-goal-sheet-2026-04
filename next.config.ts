import type { NextConfig } from "next";

const APP_NAME = "instyle-goal-sheet-2026-04";

// Vercel プレビュー時は basePath を外す（vercel.app ドメインで違和感が出ないように）
const isVercel = process.env.VERCEL === "1";

const nextConfig: NextConfig = {
  output: "standalone",
  basePath: isVercel ? "" : `/${APP_NAME}`,
  trailingSlash: false,
  reactStrictMode: true,
};

export default nextConfig;
