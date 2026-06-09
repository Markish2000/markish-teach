/**
 * Highlights the header link for the section currently dominating the viewport.
 *
 * Uses one IntersectionObserver over the sections that header anchors point at.
 * The shrunk rootMargin creates an upper-middle detection band, so the active
 * link tracks the section you are reading rather than flipping at the very edges.
 * The winning link gets `aria-current="true"` (CSS styles the rest); independent
 * of Lenis, so it works in every degradation mode.
 */

const LINK_SELECTOR = '#site-header .nav-links a[href^="#"]';
const ROOT_MARGIN = "-25% 0px -55% 0px";
const THRESHOLDS = [0, 0.25, 0.5, 0.75, 1];

export const initActiveNav = (): void => {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;

  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(LINK_SELECTOR));
  if (links.length === 0) return;

  const linkByHash = new Map<string, HTMLAnchorElement>();
  const sections: HTMLElement[] = [];
  for (const link of links) {
    const hash = link.getAttribute("href");
    if (!hash) continue;
    const section = document.querySelector(hash);
    if (section instanceof HTMLElement && section.id) {
      linkByHash.set(hash, link);
      sections.push(section);
    }
  }
  if (sections.length === 0) return;

  let current: HTMLAnchorElement | null = null;
  const ratioByHash = new Map<string, number>();

  const setActive = (hash: string | null): void => {
    const next = hash ? linkByHash.get(hash) ?? null : null;
    if (next === current) return;
    current?.removeAttribute("aria-current");
    next?.setAttribute("aria-current", "true");
    current = next;
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const hash = `#${entry.target.id}`;
        if (entry.isIntersecting) ratioByHash.set(hash, entry.intersectionRatio);
        else ratioByHash.delete(hash);
      }

      let best: string | null = null;
      let bestRatio = 0;
      for (const [hash, ratio] of ratioByHash) {
        if (ratio >= bestRatio) {
          bestRatio = ratio;
          best = hash;
        }
      }
      setActive(best);
    },
    { threshold: THRESHOLDS, rootMargin: ROOT_MARGIN }
  );

  for (const section of sections) observer.observe(section);
};
