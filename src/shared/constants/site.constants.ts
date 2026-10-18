export const SITE_URL = "https://www.markishtech.com.ar";

export const SITE_NAME = "Markish Tech";

/** Public contact channels. Every value here is published on the site and in JSON-LD. */
export const CONTACT = {
  email: "markishtech@gmail.com",
  whatsappDisplay: "+54 9 11 5164 9895",
  /** E.164, used for `tel:`, `wa.me` and schema.org `telephone`. */
  phone: "+5491151649895",
  whatsappUrl: "https://wa.me/5491151649895",
} as const;

export const ORGANIZATION = {
  name: "Markish Tech",
  url: SITE_URL,
  city: "Buenos Aires",
  region: "Ciudad Autónoma de Buenos Aires",
  country: "AR",
  logo: {
    path: "/icons/icon-512.png",
    width: 512,
    height: 512,
  },
} as const;

/**
 * Official profiles for `sameAs`. Only verified URLs: a wrong profile
 * weakens the entity instead of strengthening it.
 */
export const SOCIAL_PROFILES: ReadonlyArray<string> = [];

export const FOUNDER = {
  name: "Marcos Hernán Parella",
  givenName: "Marcos Hernán",
  familyName: "Parella",
  sameAs: ["https://www.linkedin.com/in/marcoshernanparella/"],
} as const;

/** Products and client work that Markish Tech built (see src/content/projects). */
export const PROJECT_SITES = {
  "markish-arena": "https://www.markisharena.com.ar/",
  "markish-box": "https://www.markishbox.com.ar/",
  "forja-challenge": "https://www.forjachallenge.com.ar/",
} as const;

/** X handle for `twitter:site`; empty while there is no account. */
export const TWITTER_HANDLE = "";
