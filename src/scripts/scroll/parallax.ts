import { isSmoothEnabled, subscribe } from "./controller";

interface ParallaxTarget {
  readonly el: HTMLElement;
  readonly speed: number;
}

/**
 * Subtle depth: translate `[data-parallax]` elements vertically by
 * `scroll * speed`. The attribute value is the speed factor, e.g.
 * `data-parallax="0.05"` drifts at 5% of scroll distance.
 *
 * Only runs when Lenis is active (pointer device + motion allowed); on
 * touch/reduced-motion it is a no-op so layers stay put.
 *
 * Targets are restricted to seamless layers (full-viewport backgrounds that
 * fade to the page colour, and overflow-clipped decorations) so drift never
 * exposes a hard edge.
 */
export const initParallax = (): void => {
  if (!isSmoothEnabled()) return;

  const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
  if (nodes.length === 0) return;

  const targets: ParallaxTarget[] = nodes.map((el) => {
    const parsed = Number.parseFloat(el.dataset["parallax"] ?? "");
    el.style.willChange = "transform";
    return { el, speed: Number.isFinite(parsed) ? parsed : 0 };
  });

  subscribe(({ scroll }) => {
    for (const { el, speed } of targets) {
      el.style.transform = `translate3d(0, ${(scroll * speed).toFixed(2)}px, 0)`;
    }
  });
};
