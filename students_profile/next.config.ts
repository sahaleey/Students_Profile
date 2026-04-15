declare module "next-pwa" {
  import type { NextConfig } from "next";

  type NextPWAOptions = {
    dest?: string;
    disable?: boolean;
    [key: string]: unknown;
  };

  type WithPWA = (config?: NextConfig) => NextConfig;

  export default function withPWAInit(options?: NextPWAOptions): WithPWA;
}
