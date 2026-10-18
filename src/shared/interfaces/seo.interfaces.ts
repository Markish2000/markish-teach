import type { Locale } from "@shared/types";
import type { Alternates } from "@shared/constants";

export interface SeoImage {
  /** Absolute URL or root-relative path. */
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly type?: string;
}

export interface Breadcrumb {
  readonly name: string;
  readonly path: string;
}

export type PageType = "WebPage" | "CollectionPage" | "AboutPage" | "ContactPage" | "FAQPage";

/** Everything a page tells the layout about itself. */
export interface PageMeta {
  readonly locale: Locale;
  readonly title: string;
  readonly description: string;
  /** Path of this page in every locale where it exists (must include the current locale). */
  readonly alternates: Alternates;
  readonly image?: SeoImage | undefined;
  readonly ogType?: "website" | "article";
  readonly pageType?: PageType;
  readonly breadcrumbs?: ReadonlyArray<Breadcrumb>;
  /** Extra JSON-LD nodes (Service, SoftwareApplication, ...) appended to the page graph. */
  readonly nodes?: ReadonlyArray<Record<string, unknown>>;
  /** Extra properties merged into the WebPage node (e.g. `mainEntity`). */
  readonly pageNode?: Record<string, unknown>;
  readonly noindex?: boolean;
}

export interface HreflangAlternate {
  readonly hreflang: string;
  readonly href: string;
}

export interface SeoData {
  readonly title: string;
  readonly description: string;
  readonly canonical: string;
  readonly robots: string;
  readonly alternates: ReadonlyArray<HreflangAlternate>;
  readonly image: Required<SeoImage>;
  readonly ogType: "website" | "article";
  readonly ogLocale: string;
  readonly ogLocaleAlternates: ReadonlyArray<string>;
  readonly twitterSite: string;
}
