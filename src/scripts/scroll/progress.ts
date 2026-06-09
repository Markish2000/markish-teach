import { subscribe } from "./controller";

/**
 * Drives the top progress bar by writing the 0..1 scroll progress to the
 * `--scroll-progress` custom property. The bar itself is a CSS `scaleX`, so the
 * only per-frame work here is a single custom-property write.
 */
export const initScrollProgress = (): void => {
  const root = document.documentElement;
  subscribe(({ progress }) => {
    root.style.setProperty("--scroll-progress", progress.toFixed(4));
  });
};
