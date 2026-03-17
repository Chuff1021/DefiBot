import { existsSync } from "fs";
import { join } from "path";

const EXTENSIONS = [".svg", ".png", ".jpg", ".jpeg", ".webp"];

/**
 * Returns the URL of the custom logo if one has been uploaded,
 * otherwise falls back to the default SVG logo.
 * This runs server-side only (Node.js fs).
 */
export function getLogoUrl(): string {
  const publicDir = join(process.cwd(), "public");
  for (const ext of EXTENSIONS) {
    if (existsSync(join(publicDir, `logo-custom${ext}`))) {
      return `/logo-custom${ext}`;
    }
  }
  return "/logo.svg";
}

/**
 * Returns the URL of the custom light/footer logo if one has been uploaded,
 * otherwise falls back to the default light SVG logo.
 */
export function getLightLogoUrl(): string {
  const publicDir = join(process.cwd(), "public");
  for (const ext of EXTENSIONS) {
    if (existsSync(join(publicDir, `logo-custom-light${ext}`))) {
      return `/logo-custom-light${ext}`;
    }
  }
  return "/logo-light.svg";
}
