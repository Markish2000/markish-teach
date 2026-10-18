# Markish Tech — sitio institucional

Sitio de [markishtech.com.ar](https://www.markishtech.com.ar), estudio de desarrollo web y software a medida de Buenos Aires. Astro 6, desplegado en Vercel, en español (`/es`, por defecto) e inglés (`/en`).

## Requisitos

Node.js 22.12 o superior.

## Uso

```bash
npm install
npm run dev          # desarrollo en http://localhost:4321
npm run build        # build de producción (.vercel/output) + headers
npm run preview      # sirve el build de producción localmente
npm run validate     # astro check + build + todos los tests
```

El formulario de contacto envía por Gmail SMTP y necesita `GMAIL_USER` y `GMAIL_APP_PASSWORD` (ver `.env`, no versionado). Sin ellas, en desarrollo el envío se simula; en producción la API responde 503 en vez de fingir éxito.

## Estructura

```
src/
  content/           Servicios, proyectos, FAQ y blog (YAML/Markdown, validados por src/content.config.ts)
  i18n/              Textos de interfaz es/en (mismas claves, verificado por tipos y tests)
  views/             Una vista por tipo de página, compartida entre idiomas
  pages/             Rutas finas por idioma + robots.txt, sitemap.xml, llms.txt, API de contacto
  layouts/           BaseLayout: <head> completo (SEO, hreflang, JSON-LD), header, footer
  components/        Secciones de la home, componentes de página e interactivos
  lib/content.ts     Consultas a colecciones, rutas y alternates por idioma, inventario de páginas
  shared/            Constantes (rutas, datos de contacto), helpers de SEO y JSON-LD
scripts/
  vercel-headers.mjs Post-build: caché immutable de /_astro y headers de seguridad
  serve-static.mjs   Servidor local que emula el router de Vercel
  lighthouse.mjs     Lighthouse repetido por URL y dispositivo, con mediana
tests/               Playwright + axe
docs/                Auditorías, SEO, GEO, AEO, performance y quality gates
```

## Contenido

- Servicios: `src/content/services/{es,en}/*.yaml`
- Casos de estudio: `src/content/projects/{es,en}/*.yaml` (solo resultados verificables en `results`)
- Preguntas frecuentes: `src/content/faq/{es,en}.yaml`
- Artículos: `src/content/blog/{locale}/*.md`, con `draft: true` hasta revisarlos

Guía editorial y pendientes de información: [docs/seo/content-strategy.md](docs/seo/content-strategy.md).

## Documentación

- [Auditoría inicial](docs/audits/baseline.md) y [reporte final](docs/audits/final-report.md)
- [SEO técnico](docs/seo/technical-seo.md), [datos estructurados](docs/seo/structured-data.md), [SEO internacional](docs/seo/international-seo.md)
- [Visibilidad en IA](docs/geo/ai-discoverability.md), [respuestas (AEO)](docs/aeo/answer-optimization.md)
- [Resultados de Lighthouse](docs/performance/lighthouse-results.md)
- [Quality gates](docs/testing/quality-gates.md)
- [Acciones externas pendientes](docs/seo/offsite-opportunities.md)
