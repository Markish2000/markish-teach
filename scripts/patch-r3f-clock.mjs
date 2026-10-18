#!/usr/bin/env node
/**
 * postinstall: makes @react-three/fiber use THREE.Timer instead of THREE.Clock.
 *
 * three r183+ deprecates THREE.Clock and logs a console warning every time it is
 * constructed; @react-three/fiber (up to at least 9.8.x) still creates one per
 * Canvas. This replaces it with a Clock-compatible adapter built on THREE.Timer.
 *
 * It replaces the former patch-package patch: same change, no dependencies (the
 * patch-package dependency tree carried unfixable advisories). Idempotent. If a
 * future fiber release changes shape, it only warns: the scene still works with
 * THREE.Clock, the console just shows three's deprecation warning again.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const dist = path.resolve("node_modules/@react-three/fiber/dist");
const MARK = "createTimerClock";

const adapter = (ns) => `function ${MARK}(autoStart = true) {
  const timer = new ${ns}.Timer();
  if (typeof document !== 'undefined') timer.connect(document);
  return {
    autoStart,
    startTime: 0,
    oldTime: 0,
    elapsedTime: 0,
    running: false,
    start(timestamp) {
      const now = timestamp ?? performance.now();
      this.startTime = now;
      this.oldTime = now;
      this.elapsedTime = 0;
      this.running = true;
      timer.reset();
      timer.update(now);
    },
    stop() {
      this.getElapsedTime();
      this.running = false;
      this.autoStart = false;
    },
    getElapsedTime(timestamp) {
      this.getDelta(timestamp);
      return this.elapsedTime;
    },
    getDelta(timestamp) {
      let diff = 0;
      if (this.autoStart && !this.running) {
        this.start(timestamp);
        return 0;
      }
      if (this.running) {
        timer.update(timestamp);
        diff = timer.getDelta();
        this.oldTime = timestamp ?? performance.now();
        this.elapsedTime += diff;
      }
      return diff;
    }
  };
}
`;

if (!existsSync(dist)) process.exit(0);

let patched = 0;
for (const file of readdirSync(dist).filter((f) => /^events-.*\.js$/.test(f))) {
  const full = path.join(dist, file);
  const src = readFileSync(full, "utf8");
  if (src.includes(MARK)) continue;

  const ns = src.includes("THREE__namespace.Clock()") ? "THREE__namespace" : "THREE";
  const anchor = "const isColorRepresentation =";
  const clock = `clock: new ${ns}.Clock()`;
  const delta = "let delta = state.clock.getDelta();";
  if (!src.includes(anchor) || !src.includes(clock) || !src.includes(delta)) {
    console.warn(`[patch-r3f-clock] ${file}: unexpected shape, left unpatched`);
    continue;
  }
  writeFileSync(
    full,
    src
      .replace(anchor, `${adapter(ns)}${anchor}`)
      .replace(clock, `clock: ${MARK}()`)
      .replace(delta, "let delta = state.clock.getDelta(timestamp);"),
  );
  patched++;
}
if (patched) console.log(`[patch-r3f-clock] patched ${patched} @react-three/fiber build file(s)`);
