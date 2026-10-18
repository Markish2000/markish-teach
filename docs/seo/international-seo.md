# SEO internacional

## Idiomas

| Locale | `lang` / hreflang | Prefijo | Estado |
| --- | --- | --- | --- |
| Español (por defecto) | `es-AR` | `/es` | Completo |
| Inglés | `en-US` | `/en` | Completo |

No hay portugués ni francés: no se publican traducciones parciales. Agregar un idioma requiere su JSON de UI, sus YAML de servicios y proyectos, su FAQ y sumarlo a `LOCALES`.

## Reglas implementadas

- **URLs independientes y slugs traducidos**: `/es/servicios/software-a-medida` ↔ `/en/services/custom-software`. La correspondencia la da el campo `key` compartido entre traducciones (`entryAlternates()` en `src/lib/content.ts`).
- **Canonical propio por idioma**: cada versión es canónica de sí misma; nunca apunta a la otra.
- **hreflang recíproco** en el HTML y en `sitemap.xml`, con `es-AR`, `en-US` y `x-default` → versión en español. Antes el HTML usaba `es`/`en` y el sitemap `es-AR`/`en-US`.
- **Sin redirecciones por idioma del navegador**: `/` va siempre a `/es`; ningún crawler queda bloqueado por `Accept-Language`.
- **Selector de idioma** que lleva a la página equivalente (no a la home), con `hreflang` y `lang` en cada enlace.
- **Metadatos, Open Graph (`og:locale` + `og:locale:alternate`), JSON-LD (`inLanguage`) y manifest** localizados (`site.webmanifest` y `site-en.webmanifest`).
- Se quitó `fallback: { en: "es" }`: generaba un 404 por defecto de Astro en inglés para rutas `/es/*` y un conflicto de rutas en build.

## Validación automática

- `tests/seo.spec.ts`: `lang` correcto, hreflang recíproco que apunta a páginas del sitemap con el `lang` correspondiente, `x-default` presente.
- `tests/i18n.spec.ts`: el selector lleva a la página equivalente y vuelve; los enlaces internos de cada idioma no cruzan al otro.
- `tests/content.spec.ts`: detecta palabras del otro idioma en el texto visible y exige que `es.json` y `en.json` tengan exactamente las mismas claves. El tipo `Translations` también lo exige al compilar.
