// types/next-pwa.d.ts
declare module "next-pwa" {
  // 最小限の型（必要になったら拡張してOK）
  import type { NextConfig } from "next";
  export type PWAOptions = Record<string, unknown>;
  export default function withPWA(
    options?: PWAOptions
  ): (config: NextConfig) => NextConfig;
}
