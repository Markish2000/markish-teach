import type { CSSProperties, FC, KeyboardEvent, PointerEvent } from "react";
import { useCallback, useRef, useState } from "react";
import { clamp } from "@shared/utils";
import type { BeforeAfterSliderProps } from "./BeforeAfterSlider.interfaces";

const KEYBOARD_STEP = 4;

export const BeforeAfterSlider: FC<BeforeAfterSliderProps> = ({
  tagLeft,
  tagRight,
  ariaLabel,
  beforeTitle,
  beforeStatLabels,
  beforeStatValues,
  afterTitle,
  afterStatLabels,
  afterStatValues,
}) => {
  const [split, setSplit] = useState<number>(50);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef<boolean>(false);

  const updateFromEvent = useCallback((clientX: number): void => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const ratio = ((clientX - rect.left) / rect.width) * 100;
    setSplit(clamp(ratio, 0, 100));
  }, []);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>): void => {
    draggingRef.current = true;
    (event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);
    updateFromEvent(event.clientX);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>): void => {
    if (!draggingRef.current) return;
    updateFromEvent(event.clientX);
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>): void => {
    draggingRef.current = false;
    (event.currentTarget as HTMLDivElement).releasePointerCapture(event.pointerId);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setSplit((value) => clamp(value - KEYBOARD_STEP, 0, 100));
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setSplit((value) => clamp(value + KEYBOARD_STEP, 0, 100));
    } else if (event.key === "Home") {
      event.preventDefault();
      setSplit(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setSplit(100);
    }
  };

  const splitStyle = { "--split": `${split}%` } as CSSProperties;

  return (
    <div
      ref={stageRef}
      className="ba-stage"
      role="slider"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(split)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      style={splitStyle}
    >
      <div className="ba-side before" aria-hidden="false">
        <FakeSiteBefore
          title={beforeTitle}
          statLabels={beforeStatLabels}
          statValues={beforeStatValues}
        />
      </div>
      <div className="ba-side after" aria-hidden="false">
        <FakeSiteAfter
          title={afterTitle}
          statLabels={afterStatLabels}
          statValues={afterStatValues}
        />
      </div>
      <div className="ba-handle" aria-hidden="true"></div>
      <div className="ba-knob" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M9 6l-4 6 4 6M15 6l4 6-4 6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className="ba-tag left">{tagLeft}</span>
      <span className="ba-tag right">{tagRight}</span>
    </div>
  );
};

interface FakeSiteProps {
  readonly title: string;
  readonly statLabels: ReadonlyArray<string>;
  readonly statValues: ReadonlyArray<string>;
}

const FakeSiteBefore: FC<FakeSiteProps> = ({ title, statLabels, statValues }) => (
  <div
    className="ba-fake-site"
    style={{
      background: "#d8d4cc",
      color: "#444",
      fontFamily: "Times New Roman, Times, serif",
      padding: "32px 40px",
      gap: 20,
    }}
  >
    <div style={{ fontSize: 28, fontWeight: 700, color: "#222" }}>{title}</div>
    <div style={{ height: 1, background: "#aaa", margin: "12px 0" }} />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
      {statLabels.map((label, index) => (
        <div key={label} style={{ background: "#bdb6a8", padding: "10px 12px" }}>
          <div style={{ fontSize: 11, color: "#555" }}>{label}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#202020" }}>
            {statValues[index] ?? "?"}
          </div>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 24, fontSize: 14, color: "#555", lineHeight: 1.6 }}>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum tortor quam.
    </div>
  </div>
);

const FakeSiteAfter: FC<FakeSiteProps> = ({ title, statLabels, statValues }) => (
  <div
    className="ba-fake-site"
    style={{
      background: "linear-gradient(180deg, #0a0d14 0%, #0f1320 100%)",
      color: "var(--ink)",
      padding: "32px 40px",
      gap: 20,
    }}
  >
    <div style={{ fontFamily: "var(--font-display)", fontSize: 30, letterSpacing: "-0.02em" }}>{title}</div>
    <div
      style={{
        height: 1,
        background: "linear-gradient(90deg, var(--accent), transparent)",
        margin: "12px 0",
      }}
    />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
      {statLabels.map((label, index) => (
        <div
          key={label}
          style={{
            background: "rgba(94,233,255,0.06)",
            border: "1px solid rgba(94,233,255,0.25)",
            padding: "12px 14px",
            borderRadius: 12,
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: "var(--ink-3)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontFamily: "var(--font-mono)",
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: 26,
              color: "var(--accent-2)",
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.02em",
              marginTop: 4,
            }}
          >
            {statValues[index] ?? "?"}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default BeforeAfterSlider;
