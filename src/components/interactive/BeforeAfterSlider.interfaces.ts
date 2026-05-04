export interface BeforeAfterSliderProps {
  readonly tagLeft: string;
  readonly tagRight: string;
  readonly ariaLabel: string;
  readonly beforeTitle: string;
  readonly beforeStatLabels: ReadonlyArray<string>;
  readonly beforeStatValues: ReadonlyArray<string>;
  readonly afterTitle: string;
  readonly afterStatLabels: ReadonlyArray<string>;
  readonly afterStatValues: ReadonlyArray<string>;
}
