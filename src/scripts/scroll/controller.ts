/**
 * Single source of truth for page scroll position, on top of native scrolling.
 *
 * It never reads layout synchronously (no forced reflows):
 *  - document and viewport heights come from ResizeObserver entries, which are
 *    delivered after layout has been computed;
 *  - `scrollY` is only read inside scroll events.
 *
 * Smooth anchor jumps come from CSS `scroll-behavior` (disabled under
 * prefers-reduced-motion), so focus and URL semantics stay native.
 * progress / parallax subscribe here instead of attaching their own listeners.
 */

export interface ScrollState {
  readonly scroll: number;
  readonly limit: number;
  readonly progress: number;
}

type Subscriber = (state: ScrollState) => void;

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";
const TOUCH_QUERY = "(hover: none) and (pointer: coarse)";

const matches = (query: string): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia(query).matches;

const subscribers: Subscriber[] = [];
let state: ScrollState = { scroll: 0, limit: 1, progress: 0 };

const setState = (next: ScrollState): void => {
  state = next;
  for (const fn of subscribers) fn(state);
};

/** Current scroll state — useful for one-off reads outside the subscribe loop. */
export const getScrollState = (): ScrollState => state;

/** Decorative scroll motion only on pointer devices that allow motion. */
export const allowsScrollMotion = (): boolean => !matches(REDUCE_QUERY) && !matches(TOUCH_QUERY);

/** Register a per-frame listener. Fires once immediately with the current state. */
export const subscribe = (fn: Subscriber): void => {
  subscribers.push(fn);
  fn(state);
};

/** On the home page, clicking the brand logo glides to the top instead of reloading. */
const bindBrandToTop = (): void => {
  document.addEventListener("click", (event) => {
    if (event.defaultPrevented) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const brand = target.closest<HTMLAnchorElement>("a.brand");
    if (!brand || brand.pathname !== window.location.pathname) return;
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: matches(REDUCE_QUERY) ? "auto" : "smooth" });
    if (window.location.hash) window.history.replaceState(null, "", window.location.pathname);
  });
};

export const initScrollController = (): void => {
  if (typeof window === "undefined") return;

  let scroll = 0;
  let documentHeight = 0;
  let viewportHeight = 0;

  const publish = (): void => {
    const limit = Math.max(1, documentHeight - viewportHeight);
    setState({ scroll, limit, progress: Math.min(1, scroll / limit) });
  };

  // A fixed, invisible full-viewport box: its observed size is the viewport size.
  const viewport = document.createElement("div");
  viewport.setAttribute("aria-hidden", "true");
  viewport.style.cssText = "position:fixed;inset:0;visibility:hidden;pointer-events:none;z-index:-1";
  document.body.append(viewport);

  const sizes = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const height = entry.borderBoxSize[0]?.blockSize ?? entry.contentRect.height;
      if (entry.target === viewport) viewportHeight = height;
      else documentHeight = height;
    }
    publish();
  });
  sizes.observe(document.documentElement);
  sizes.observe(viewport);

  window.addEventListener(
    "scroll",
    () => {
      scroll = window.scrollY;
      publish();
    },
    { passive: true },
  );

  bindBrandToTop();
};
