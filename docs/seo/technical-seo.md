# SEO técnico

Cómo está configurado el SEO técnico del sitio y dónde se toca cada pieza.

## Rutas y URLs

- Todas las URLs públicas salen de un único registro: `SECTIONS` + `localePath()` en `src/shared/constants/routes.constants.ts`. Servicios y proyectos agregan su `slug` desde las colecciones de contenido.
- Formato: `https://www.markishtech.com.ar/{locale}/{sección}/{slug}`, sin barra final (`trailingSlash: "never"`).
- Redirecciones (todas permanentes):
  - `/` → `/es` (301, `redirects` en `astro.config.mjs`).
  - `/x/` → `/x` (308, generada por el adapter de Vercel).
  - `/x/index.html` → `/x` (308, `scripts/vercel-headers.mjs`): evita copias indexables del HTML estático.
- 404: `src/pages/404.astro`, con marca, `noindex, follow` y enlaces útiles. Vercel lo sirve con estado 404 para cualquier URL desconocida.

## Metadatos por página

`src/layouts/BaseLayout.astro` recibe un `PageMeta` y genera todo el `<head>` con `getSeo()` (`src/shared/helpers/seo.helpers.ts`):

| Elemento | Origen |
| --- | --- |
| `<title>`, `meta description` | `seo.*` en `src/i18n/{es,en}.json` para páginas fijas; `title`/`description` en cada YAML de servicio o proyecto |
| `canonical` | URL absoluta de la propia página, siempre autorreferente |
| `meta robots` | `index, follow, max-image-preview:large`; `noindex, follow` solo en el 404 |
| `hreflang` | Ver `international-seo.md` |
| Open Graph / Twitter | Mismo título y descripción; imagen por defecto `/icons/og.png` o captura del proyecto (JPEG 1200 px generado en build) |
| `lang` | `es-AR` / `en-US` |

El schema de las colecciones (`src/content.config.ts`) limita `title` a 70 caracteres y `description` a 70–170, así que un texto fuera de rango rompe el build.

## Rastreo

- `robots.txt` lo genera `src/pages/robots.txt.ts`: todo permitido salvo `/api/`, con `Sitemap:` absoluto. La política para crawlers de IA está en `docs/geo/ai-discoverability.md`.
- `sitemap.xml` lo genera `src/pages/sitemap.xml.ts` a partir de `getAllPages()` (`src/lib/content.ts`): solo páginas canónicas e indexables, con `xhtml:link` hreflang recíprocos. Los borradores del blog nunca entran.
- `sitemap-index.xml` se mantiene por continuidad (la versión anterior del sitio lo publicaba) y apunta a `sitemap.xml`.
- No se publica `lastmod`: no hay una fecha confiable por página y Google ignora `lastmod` cuando no es consistentemente exacto. Si se agrega, debe salir de una fecha real de modificación del contenido.

## HTML semántico

- Un solo `<h1>` por página, `<h2>` por sección y `<h3>` para tarjetas. Los títulos de servicios, problemas y proyectos ahora son encabezados reales (antes eran `div`).
- Landmarks: `header`, `nav` con nombre (principal, pie, migas), `main#main`, `footer`; secciones con `aria-labelledby`.
- Todo el contenido principal está en el HTML servido (Astro estático). Ningún texto depende de JavaScript para existir, lo que importa tanto para Googlebot como para crawlers de IA que no ejecutan JS.

## Enlazado interno

- Navegación principal: Servicios, Proyectos, Sobre nosotros, FAQ, Contacto.
- Home → cada servicio y cada caso; cada problema de la home enlaza al servicio que lo resuelve.
- Servicio → casos relacionados, otros servicios y contacto.
- Caso → servicios aplicados, otros proyectos, sitio público del proyecto.
- FAQ → servicio o caso que amplía cada respuesta.
- Pie: todas las páginas institucionales, los cinco servicios, contacto y perfil del fundador.

`tests/links.spec.ts` recorre todos los enlaces internos de todas las páginas y falla si alguno no responde 200 directo (sin redirección) o si un `#ancla` no existe.

## Headers HTTP

`scripts/vercel-headers.mjs` corre después de `astro build` (`npm run build`, y `vercel.json` fija ese comando en Vercel). Inserta antes de la fase `filesystem` del router de Vercel:

- `cache-control: public, max-age=31536000, immutable` en `/_astro/*` (assets con hash). El adapter oficial agrega esta regla después de `filesystem`, donde no aplica a archivos estáticos: en producción esos assets se servían con `max-age=0`.
- `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`.

La CSP permite `'unsafe-inline'` en scripts y estilos porque el sitio usa scripts inline de Astro y atributos `style`. Mejora pendiente: activar `security.csp` de Astro (hashes) después de mover los `style="..."` a clases.

**Pendiente de verificar en un deploy de preview**: que Vercel respete `vercel.json` → `buildCommand` y que los headers aparezcan en las respuestas reales (`curl -sI https://<preview>/es`).

## Verificación

```bash
npm run build
npm run test:seo   # títulos, descripciones, canonical, h1, hreflang, robots, sitemap, llms.txt, JSON-LD
npx playwright test tests/links.spec.ts tests/routes.spec.ts
```
