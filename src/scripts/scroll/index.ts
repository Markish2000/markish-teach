import { initScrollController } from "./controller";
import { initScrollProgress } from "./progress";
import { initParallax } from "./parallax";

/**
 * Premium scroll behaviours, wired in one place.
 *
 * Order matters: the controller must initialise first so subscribers know
 * whether smooth scroll is active and receive the correct initial state.
 */
export const initScroll = (): void => {
  initScrollController();
  initScrollProgress();
  initParallax();
};
