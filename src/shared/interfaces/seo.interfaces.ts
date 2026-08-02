import type { Locale } from "@shared/types";

export interface OpenGraphMeta {
  readonly title: string;
  readonly description: string;
  readonly image: string;
  readonly imageSecureUrl: string;
  readonly imageAlt: string;
  readonly imageType: string;
  readonly imageWidth: number;
  readonly imageHeight: number;
  readonly type: "website" | "article";
  readonly siteName: string;
  readonly locale: string;
  readonly localeAlternates: ReadonlyArray<string>;
}

export interface TwitterMeta {
  readonly card: "summary" | "summary_large_image";
  readonly title: string;
  readonly description: string;
  readonly image: string;
  readonly imageAlt: string;
  /** Handle `@cuenta`; vacío cuando todavía no hay cuenta de X. */
  readonly site: string;
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

interface JsonLdRef {
  readonly "@id": string;
}

export interface PostalAddressJsonLd {
  readonly "@type": "PostalAddress";
  readonly addressLocality: string;
  readonly addressRegion: string;
  readonly addressCountry: string;
}

export interface ImageObjectJsonLd {
  readonly "@type": "ImageObject";
  readonly "@id": string;
  readonly url: string;
  readonly contentUrl: string;
  readonly width: number;
  readonly height: number;
}

export interface OrganizationJsonLd {
  readonly "@type": "Organization";
  readonly "@id": string;
  readonly name: string;
  readonly legalName: string;
  readonly url: string;
  readonly email: string;
  readonly description: string;
  readonly logo: ImageObjectJsonLd;
  readonly image: JsonLdRef;
  readonly address: PostalAddressJsonLd;
  readonly areaServed: string;
  readonly knowsLanguage: ReadonlyArray<string>;
  readonly sameAs?: ReadonlyArray<string>;
}

export interface WebSiteJsonLd {
  readonly "@type": "WebSite";
  readonly "@id": string;
  readonly url: string;
  readonly name: string;
  readonly description: string;
  readonly inLanguage: ReadonlyArray<string>;
  readonly publisher: JsonLdRef;
}

export interface ProfessionalServiceJsonLd {
  readonly "@type": "ProfessionalService";
  readonly "@id": string;
  readonly name: string;
  readonly url: string;
  readonly description: string;
  readonly email: string;
  readonly image: JsonLdRef;
  readonly address: PostalAddressJsonLd;
  readonly areaServed: string;
  readonly provider: JsonLdRef;
  readonly serviceType: ReadonlyArray<string>;
}

export interface WebPageJsonLd {
  readonly "@type": "WebPage";
  readonly "@id": string;
  readonly url: string;
  readonly name: string;
  readonly description: string;
  readonly inLanguage: string;
  readonly isPartOf: JsonLdRef;
  readonly about: JsonLdRef;
  readonly primaryImageOfPage: JsonLdRef;
}

export type SiteJsonLdNode =
  | OrganizationJsonLd
  | WebSiteJsonLd
  | ProfessionalServiceJsonLd
  | WebPageJsonLd;

export interface SiteJsonLd {
  readonly "@context": "https://schema.org";
  readonly "@graph": ReadonlyArray<SiteJsonLdNode>;
}

export interface BaseLayoutProps {
  readonly locale: Locale;
  readonly page: SeoPageId;
}

export type SeoPageId = "home";
