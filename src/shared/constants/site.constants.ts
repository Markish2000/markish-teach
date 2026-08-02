export const SITE_URL = "https://www.markishtech.com.ar";

export const SITE_NAME = "Markish";

export const ORGANIZATION = {
  name: "Markish",
  legalName: "Markish",
  url: SITE_URL,
  email: "markishtech@gmail.com",
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
 * Perfiles oficiales para `sameAs` en el JSON-LD.
 * Solo URLs verificadas: un perfil inexistente degrada la entidad ante Google.
 */
export const SOCIAL_PROFILES: ReadonlyArray<string> = [];

/** Handle de X para `twitter:site`; vacío si todavía no hay cuenta. */
export const TWITTER_HANDLE = "";
