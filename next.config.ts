// next.config.ts
import type { NextConfig } from "next";
import withPWA from "next-pwa";

const isProd = process.env.NODE_ENV === "production";

const baseConfig: NextConfig = {
  reactStrictMode: true,
};

export default withPWA({
  dest: "public", // sw.js を public/ に出力
  disable: !isProd, // devでは無効、本番で有効
  register: true, // 自動登録
  skipWaiting: true, // 新SWを即時有効化
  runtimeCaching: [
    {
      // HTMLはまずネット、落ちたらキャッシュ
      urlPattern: ({ request }: { request: Request }) =>
        request.destination === "document",
      handler: "NetworkFirst",
      options: { cacheName: "html" },
    },
    {
      // JS/CSS/workerはSWR
      urlPattern: ({ request }: { request: Request }) =>
        request.destination === "script" ||
        request.destination === "style" ||
        request.destination === "worker",
      handler: "StaleWhileRevalidate",
      options: { cacheName: "static-resources" },
    },
    {
      // 画像はSWR＋期限
      urlPattern: ({ request }: { request: Request }) =>
        request.destination === "image",
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "images",
        expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    {
      // あなたのニュースJSON（public/data/news/**）
      urlPattern: ({ url }: { url: URL }) =>
        url.pathname.startsWith("/data/news/"),
      handler: "StaleWhileRevalidate",
      options: { cacheName: "news-json" },
    },
  ],
})(baseConfig);
