import type { Locale } from "@shared/types";
import { LOCALES, DEFAULT_LOCALE } from "@shared/types";
import {
  ORGANIZATION,
  SITE_NAME,
  SITE_URL,
  SOCIAL_PROFILES,
  TWITTER_HANDLE,
} from "@shared/constants";
import { getTranslations } from "@i18n";
import type {
  HreflangAlternate,
  ImageObjectJsonLd,
  PostalAddressJsonLd,
  SeoData,
  SeoPageId,
  SiteJsonLd,
  SiteJsonLdNode,
} from "@shared/interfaces";

const ogImagePath = "/icons/og.png";

/** Identificadores estables del `@graph`: permiten referenciar nodos entre sí. */
const NODE_ID = {
  organization: `${SITE_URL}/#organization`,
  website: `${SITE_URL}/#website`,
  service: `${SITE_URL}/#service`,
  logo: `${SITE_URL}/#logo`,
} as const;

const SERVICE_TYPES: Record<Locale, ReadonlyArray<string>> = {
  es: [
    "Diseño web",
    "Desarrollo web",
    "Optimización de performance web",
    "Accesibilidad web",
  ],
  en: [
    "Web design",
    "Web development",
    "Web performance optimization",
    "Web accessibility",
  ],
};

const ogLocaleFor = (locale: Locale): string =>
  locale === "es" ? "es_AR" : "en_US";

const bcp47For = (locale: Locale): string => (locale === "es" ? "es-AR" : "en-US");

const buildAlternates = (page: SeoPageId): ReadonlyArray<HreflangAlternate> => {
  const path = page === "home" ? "" : `/${page}`;
  const alternates: HreflangAlternate[] = LOCALES.map((locale) => ({
    hreflang: locale,
    href: `${SITE_URL}/${locale}${path}`,
  }));
  alternates.push({ hreflang: "x-default", href: `${SITE_URL}/${DEFAULT_LOCALE}${path}` });
  return alternates;
};

interface GetSeoArgs {
  readonly locale: Locale;
  readonly page: SeoPageId;
}

export const getSeo = ({ locale, page }: GetSeoArgs): SeoData => {
  const translations = getTranslations(locale);
  const meta = translations.seo[page];
  const path = page === "home" ? "" : `/${page}`;
  const canonical = `${SITE_URL}/${locale}${path}`;
  const ogImage = `${SITE_URL}${ogImagePath}`;

  return {
    title: meta.title,
    description: meta.description,
    canonical,
    alternates: buildAlternates(page),
    openGraph: {
      title: meta.og_title,
      description: meta.og_description,
      image: ogImage,
      imageSecureUrl: ogImage,
      imageAlt: meta.og_image_alt,
      imageType: "image/png",
      imageWidth: 1200,
      imageHeight: 630,
      type: "website",
      siteName: SITE_NAME,
      locale: ogLocaleFor(locale),
      localeAlternates: LOCALES.filter((item) => item !== locale).map(ogLocaleFor),
    },
    twitter: {
      card: "summary_large_image",
      title: meta.og_title,
      description: meta.og_description,
      image: ogImage,
      imageAlt: meta.og_image_alt,
      site: TWITTER_HANDLE,
    },
    themeColor: "#05070b",
  };
};

const buildAddress = (): PostalAddressJsonLd => ({
  "@type": "PostalAddress",
  addressLocality: ORGANIZATION.city,
  addressRegion: ORGANIZATION.region,
  addressCountry: ORGANIZATION.country,
});

const buildLogo = (): ImageObjectJsonLd => {
  const url = `${SITE_URL}${ORGANIZATION.logo.path}`;
  return {
    "@type": "ImageObject",
    "@id": NODE_ID.logo,
    url,
    contentUrl: url,
    width: ORGANIZATION.logo.width,
    height: ORGANIZATION.logo.height,
  };
};

/**
 * `@graph` único con Organization + WebSite + ProfessionalService + WebPage.
 * Un solo bloque evita entidades duplicadas y deja que Google las relacione por `@id`.
 */
export const getSiteJsonLd = ({ locale, page }: GetSeoArgs): SiteJsonLd => {
  const translations = getTranslations(locale);
  const meta = translations.seo[page];
  const path = page === "home" ? "" : `/${page}`;
  const canonical = `${SITE_URL}/${locale}${path}`;
  const languages = LOCALES.map(bcp47For);

  const nodes: SiteJsonLdNode[] = [
    {
      "@type": "Organization",
      "@id": NODE_ID.organization,
      name: ORGANIZATION.name,
      legalName: ORGANIZATION.legalName,
      url: ORGANIZATION.url,
      email: ORGANIZATION.email,
      description: meta.description,
      logo: buildLogo(),
      image: { "@id": NODE_ID.logo },
      address: buildAddress(),
      areaServed: ORGANIZATION.country,
      knowsLanguage: languages,
      ...(SOCIAL_PROFILES.length > 0 ? { sameAs: SOCIAL_PROFILES } : {}),
    },
    {
      "@type": "WebSite",
      "@id": NODE_ID.website,
      url: SITE_URL,
      name: SITE_NAME,
      description: meta.description,
      inLanguage: languages,
      publisher: { "@id": NODE_ID.organization },
    },
    {
      "@type": "ProfessionalService",
      "@id": NODE_ID.service,
      name: ORGANIZATION.name,
      url: SITE_URL,
      description: meta.description,
      email: ORGANIZATION.email,
      image: { "@id": NODE_ID.logo },
      address: buildAddress(),
      areaServed: ORGANIZATION.country,
      provider: { "@id": NODE_ID.organization },
      serviceType: SERVICE_TYPES[locale],
    },
    {
      "@type": "WebPage",
      "@id": `${canonical}#webpage`,
      url: canonical,
      name: meta.title,
      description: meta.description,
      inLanguage: bcp47For(locale),
      isPartOf: { "@id": NODE_ID.website },
      about: { "@id": NODE_ID.organization },
      primaryImageOfPage: { "@id": NODE_ID.logo },
    },
  ];

  return { "@context": "https://schema.org", "@graph": nodes };
};
