import { isOldIOS } from "./deviceDetect";

export function getGlassClass(): string {
  return isOldIOS() ? "glass glass-fallback" : "glass";
}
