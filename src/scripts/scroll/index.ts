import { initScrollController } from "./controller";
import { initScrollProgress } from "./progress";
import { initParallax } from "./parallax";

/**
 * Scroll-driven effects, wired in one place. The controller initialises first
 * so subscribers receive the correct initial state.
 */
export const initScroll = (): void => {
  initScrollController();
  initScrollProgress();
  initParallax();
};
