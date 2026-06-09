import Lenis from "lenis";

/**
 * Single source of truth for page scroll position.
 *
 * Lenis owns the requestAnimationFrame loop and provides smooth inertia on
 * pointer devices. progress / parallax / active-nav subscribe here instead of
 * each attaching its own scroll listener, so there is exactly one read per frame.
 *
 * On touch devices and when prefers-reduced-motion is set, Lenis is NOT created:
 * native momentum scrolling is already good on touch and inertia hijacking can
 * feel laggy, while reduced-motion must keep native behaviour. In those cases a
 * lightweight native scroll listener still feeds the progress bar.
 */

export interface ScrollState {
  readonly scroll: number;
  readonly limit: number;
  readonly progress: number;
  readonly velocity: number;
}

type Subscriber = (state: ScrollState) => void;

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";
const TOUCH_QUERY = "(hover: none) and (pointer: coarse)";
const HEADER_GAP = 12;

const matches = (query: string): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia(query).matches;

const subscribers: Subscriber[] = [];
let lenis: Lenis | null = null;
let state: ScrollState = { scroll: 0, limit: 1, progress: 0, velocity: 0 };

const setState = (next: ScrollState): void => {
  state = next;
  for (const fn of subscribers) fn(state);
};

const readNative = (): ScrollState => {
  const scroll = window.scrollY;
  const limit = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  return { scroll, limit, progress: Math.min(1, scroll / limit), velocity: 0 };
};

/** Current scroll state — useful for one-off reads outside the subscribe loop. */
export const getScrollState = (): ScrollState => state;

/** True when Lenis is driving the page (pointer device + motion allowed). */
export const isSmoothEnabled = (): boolean => lenis !== null;

/** Register a per-frame listener. Fires once immediately with the current state. */
export const subscribe = (fn: Subscriber): void => {
  subscribers.push(fn);
  fn(state);
};

const headerOffset = (): number => {
  const header = document.getElementById("site-header");
  return header ? header.offsetHeight + HEADER_GAP : 0;
};

/** Scroll the page to the very top, reusing Lenis easing when it is active. */
const scrollToTop = (): void => {
  if (lenis) {
    lenis.scrollTo(0);
    return;
  }
  const behavior = matches(REDUCE_QUERY) ? "auto" : "smooth";
  window.scrollTo({ top: 0, behavior });
};

/** Clicking the brand logo glides to the top instead of reloading the page. */
const bindBrandToTop = (): void => {
  document.addEventListener("click", (event) => {
    if (event.defaultPrevented) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (!target.closest(".brand")) return;
    event.preventDefault();
    scrollToTop();
    if (window.history && window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  });
};

/** Route in-page anchor clicks through Lenis so jumps inherit the smooth easing. */
const bindAnchorLinks = (instance: Lenis): void => {
  document.addEventListener("click", (event) => {
    if (event.defaultPrevented) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const link = target.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute("href");
    if (!hash || hash === "#") return;
    const dest = document.querySelector(hash);
    if (!(dest instanceof HTMLElement)) return;
    event.preventDefault();
    instance.scrollTo(dest, { offset: -headerOffset() });
  });
};

export const initScrollController = (): void => {
  if (typeof window === "undefined") return;

  if (!matches(REDUCE_QUERY) && !matches(TOUCH_QUERY)) {
    const instance = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis = instance;
    // Lenis owns smoothing; native CSS smooth on top double-eases and feels laggy.
    document.documentElement.style.scrollBehavior = "auto";

    instance.on("scroll", () => {
      const limit = Math.max(1, instance.limit);
      setState({
        scroll: instance.scroll,
        limit,
        progress: Math.min(1, instance.scroll / limit),
        velocity: instance.velocity,
      });
    });

    const raf = (time: number): void => {
      instance.raf(time);
      window.requestAnimationFrame(raf);
    };
    window.requestAnimationFrame(raf);

    bindAnchorLinks(instance);
    bindBrandToTop();
    setState(readNative());
    return;
  }

  // Native fallback (touch / reduced-motion): keep the progress bar fed only.
  const onScroll = (): void => setState(readNative());
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  bindBrandToTop();
  onScroll();
};
