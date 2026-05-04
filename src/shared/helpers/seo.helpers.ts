import type { Locale } from "@shared/types";
import { LOCALES, DEFAULT_LOCALE } from "@shared/types";
import { ORGANIZATION, SITE_NAME, SITE_URL } from "@shared/constants";
import { getTranslations } from "@i18n";
import type {
  HreflangAlternate,
  OrganizationJsonLd,
  SeoData,
  SeoPageId,
} from "@shared/interfaces";

const ogImagePath = "/og.svg";

const ogLocaleFor = (locale: Locale): string =>
  locale === "es" ? "es_AR" : "en_US";

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
      imageAlt: meta.og_image_alt,
      type: "website",
      siteName: SITE_NAME,
      locale: ogLocaleFor(locale),
    },
    twitter: {
      card: "summary_large_image",
      title: meta.og_title,
      description: meta.og_description,
      image: ogImage,
    },
    themeColor: "#05070b",
  };
};

export const getOrganizationJsonLd = (locale: Locale): OrganizationJsonLd => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: ORGANIZATION.name,
  url: ORGANIZATION.url,
  email: ORGANIZATION.email,
  address: {
    "@type": "PostalAddress",
    addressLocality: ORGANIZATION.city,
    addressCountry: ORGANIZATION.country,
  },
  inLanguage: locale === "es" ? ["es", "en"] : ["en", "es"],
});
