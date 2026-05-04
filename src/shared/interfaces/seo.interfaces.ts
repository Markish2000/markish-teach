import type { Locale } from "@shared/types";

export interface OpenGraphMeta {
  readonly title: string;
  readonly description: string;
  readonly image: string;
  readonly imageAlt: string;
  readonly type: "website" | "article";
  readonly siteName: string;
  readonly locale: string;
}

export interface TwitterMeta {
  readonly card: "summary" | "summary_large_image";
  readonly title: string;
  readonly description: string;
  readonly image: string;
}

export interface HreflangAlternate {
  readonly hreflang: string;
  readonly href: string;
}

export interface SeoData {
  readonly title: string;
  readonly description: string;
  readonly canonical: string;
  readonly alternates: ReadonlyArray<HreflangAlternate>;
  readonly openGraph: OpenGraphMeta;
  readonly twitter: TwitterMeta;
  readonly themeColor: string;
}

export interface OrganizationJsonLd {
  readonly "@context": "https://schema.org";
  readonly "@type": "Organization";
  readonly name: string;
  readonly url: string;
  readonly email: string;
  readonly address: {
    readonly "@type": "PostalAddress";
    readonly addressLocality: string;
    readonly addressCountry: string;
  };
  readonly inLanguage: ReadonlyArray<string>;
}

export interface BaseLayoutProps {
  readonly locale: Locale;
  readonly page: SeoPageId;
}

export type SeoPageId = "home";
