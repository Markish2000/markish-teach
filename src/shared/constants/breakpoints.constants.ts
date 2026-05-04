export const BREAKPOINTS = {
  xs: 360,
  sm: 480,
  md: 760,
  lg: 1100,
  xl: 1360,
  "2xl": 1600,
  "3xl": 1920,
} as const;

export type BreakpointName = keyof typeof BREAKPOINTS;
