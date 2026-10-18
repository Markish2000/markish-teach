import type { Locale } from "@shared/types";
import { DEFAULT_LOCALE, LOCALES } from "@shared/types";
import {
  CONTACT,
  FOUNDER,
  ORGANIZATION,
  SITE_NAME,
  SITE_URL,
  SOCIAL_PROFILES,
  TWITTER_HANDLE,
  localePath,
} from "@shared/constants";
import type { HreflangAlternate, PageMeta, SeoData, SeoImage } from "@shared/interfaces";

/** BCP 47 tags used in `<html lang>`, hreflang, `inLanguage` and the sitemap. */
export const LANG_TAG: Record<Locale, string> = { es: "es-AR", en: "en-US" };
const OG_LOCALE: Record<Locale, string> = { es: "es_AR", en: "en_US" };

const DEFAULT_IMAGE: Record<Locale, SeoImage> = {
  es: {
    src: "/icons/og.png",
    width: 1200,
    height: 630,
    alt: "Markish Tech — desarrollo web y software a medida",
  },
  en: {
    src: "/icons/og.png",
    width: 1200,
    height: 630,
    alt: "Markish Tech — web development and custom software",
  },
};

/** Stable `@id`s so nodes can reference each other across pages. */
export const NODE_ID = {
  organization: `${SITE_URL}/#organization`,
  website: `${SITE_URL}/#website`,
  founder: `${SITE_URL}/#founder`,
  logo: `${SITE_URL}/#logo`,
} as const;

export const absoluteUrl = (pathOrUrl: string): string => new URL(pathOrUrl, SITE_URL).href;

const IMAGE_TYPES: Record<string, string> = { webp: "image/webp", jpg: "image/jpeg", avif: "image/avif" };
const imageType = (src: string): string => IMAGE_TYPES[src.split(".").pop() ?? ""] ?? "image/png";

export const getSeo = (meta: PageMeta): SeoData => {
  const { locale, alternates } = meta;
  const ownPath = alternates[locale];
  if (!ownPath) throw new Error(`alternates must include the current locale (${locale})`);

  const hreflang: HreflangAlternate[] = LOCALES.flatMap((l) => {
    const p = alternates[l];
    return p ? [{ hreflang: LANG_TAG[l], href: absoluteUrl(p) }] : [];
  });
  const xDefault = alternates[DEFAULT_LOCALE] ?? ownPath;
  if (hreflang.length > 1) hreflang.push({ hreflang: "x-default", href: absoluteUrl(xDefault) });

  const image = meta.image ?? DEFAULT_IMAGE[locale];
  const imageUrl = absoluteUrl(image.src);

  return {
    title: meta.title,
    description: meta.description,
    canonical: absoluteUrl(ownPath),
    robots: meta.noindex ? "noindex, follow" : "index, follow, max-image-preview:large",
    alternates: hreflang,
    image: { ...image, src: imageUrl, type: image.type ?? imageType(imageUrl) },
    ogType: meta.ogType ?? "website",
    ogLocale: OG_LOCALE[locale],
    ogLocaleAlternates: LOCALES.filter((l) => l !== locale && alternates[l]).map(
      (l) => OG_LOCALE[l],
    ),
    twitterSite: TWITTER_HANDLE,
  };
};

interface OrgCopy {
  readonly description: string;
  readonly founderTitle: string;
  readonly contactType: string;
  readonly knowsAbout: ReadonlyArray<string>;
}

export const ORG_COPY: Record<Locale, OrgCopy> = {
  es: {
    description:
      "Estudio de desarrollo de software de Buenos Aires, Argentina. Desarrolla sitios web, aplicaciones web y plataformas SaaS a medida, con foco en performance, SEO técnico y accesibilidad.",
    founderTitle: "Fundador y desarrollador de software",
    contactType: "consultas comerciales",
    knowsAbout: [
      "Desarrollo web",
      "Desarrollo de software a medida",
      "Plataformas SaaS multi-tenant",
      "Astro",
      "Next.js",
      "React",
      "NestJS",
      "SEO técnico",
      "Core Web Vitals",
      "Accesibilidad web (WCAG)",
    ],
  },
  en: {
    description:
      "Software development studio based in Buenos Aires, Argentina. Builds custom websites, web applications and SaaS platforms, with a focus on performance, technical SEO and accessibility.",
    founderTitle: "Founder and software developer",
    contactType: "sales inquiries",
    knowsAbout: [
      "Web development",
      "Custom software development",
      "Multi-tenant SaaS platforms",
      "Astro",
      "Next.js",
      "React",
      "NestJS",
      "Technical SEO",
      "Core Web Vitals",
      "Web accessibility (WCAG)",
    ],
  },
};

/** Organization, founder and WebSite: present on every page with the same `@id`s. */
const siteNodes = (locale: Locale): Record<string, unknown>[] => {
  const copy = ORG_COPY[locale];
  const logoUrl = absoluteUrl(ORGANIZATION.logo.path);
  return [
    {
      "@type": "Organization",
      "@id": NODE_ID.organization,
      name: ORGANIZATION.name,
      url: `${SITE_URL}/`,
      description: copy.description,
      email: CONTACT.email,
      telephone: CONTACT.phone,
      logo: {
        "@type": "ImageObject",
        "@id": NODE_ID.logo,
        url: logoUrl,
        contentUrl: logoUrl,
        width: ORGANIZATION.logo.width,
        height: ORGANIZATION.logo.height,
      },
      image: { "@id": NODE_ID.logo },
      address: {
        "@type": "PostalAddress",
        addressLocality: ORGANIZATION.city,
        addressRegion: ORGANIZATION.region,
        addressCountry: ORGANIZATION.country,
      },
      areaServed: { "@type": "Country", name: "Argentina" },
      knowsLanguage: LOCALES.map((l) => LANG_TAG[l]),
      knowsAbout: copy.knowsAbout,
      founder: { "@id": NODE_ID.founder },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: copy.contactType,
        email: CONTACT.email,
        telephone: CONTACT.phone,
        availableLanguage: ["Spanish", "English"],
        url: absoluteUrl(localePath(locale, "contact")),
      },
      ...(SOCIAL_PROFILES.length > 0 ? { sameAs: SOCIAL_PROFILES } : {}),
    },
    {
      "@type": "Person",
      "@id": NODE_ID.founder,
      name: FOUNDER.name,
      givenName: FOUNDER.givenName,
      familyName: FOUNDER.familyName,
      jobTitle: copy.founderTitle,
      worksFor: { "@id": NODE_ID.organization },
      url: absoluteUrl(localePath(locale, "about")),
      sameAs: FOUNDER.sameAs,
    },
    {
      "@type": "WebSite",
      "@id": NODE_ID.website,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      inLanguage: LOCALES.map((l) => LANG_TAG[l]),
      publisher: { "@id": NODE_ID.organization },
    },
  ];
};

/** Full `@graph` for a page: site entities + WebPage + breadcrumbs + page-specific nodes. */
export const getJsonLd = (meta: PageMeta, seo: SeoData): Record<string, unknown> => {
  const pageId = `${seo.canonical}#webpage`;
  const crumbs = meta.breadcrumbs ?? [];
  const breadcrumbId = `${seo.canonical}#breadcrumb`;
  const nodes: Record<string, unknown>[] = [
    ...siteNodes(meta.locale),
    {
      "@type": meta.pageType ?? "WebPage",
      "@id": pageId,
      url: seo.canonical,
      name: meta.title,
      description: meta.description,
      inLanguage: LANG_TAG[meta.locale],
      isPartOf: { "@id": NODE_ID.website },
      publisher: { "@id": NODE_ID.organization },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: seo.image.src,
        width: seo.image.width,
        height: seo.image.height,
      },
      ...(crumbs.length > 1 ? { breadcrumb: { "@id": breadcrumbId } } : {}),
      ...meta.pageNode,
    },
  ];
  if (crumbs.length > 1) {
    nodes.push({
      "@type": "BreadcrumbList",
      "@id": breadcrumbId,
      itemListElement: crumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: absoluteUrl(crumb.path),
      })),
    });
  }
  nodes.push(...(meta.nodes ?? []));
  return { "@context": "https://schema.org", "@graph": nodes };
};

/** `@id` of the WebPage node for a path, for nodes that point back to their page. */
export const pageNodeId = (path: string): string => `${absoluteUrl(path)}#webpage`;
