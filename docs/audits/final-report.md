# Reporte final — Auditoría y optimización (2026-10-18)

Rama `feat/seo-geo-aeo-audit`. Sin push ni deploy. Situación inicial en [baseline.md](baseline.md).

## Resumen ejecutivo

El sitio era una landing de dos URLs (`/es`, `/en`) con buena base técnica pero con contenido ficticio presentado como real ("Antes y después" de "Acme Corp" con Lorem ipsum y métricas inventadas, disponibilidad vencida, chatbot guionado que se declaraba "En línea"), sin páginas que pudieran posicionar servicios o proyectos, con assets sin caché en producción, sin política de privacidad y con un formulario que en producción podía fingir éxito si faltaban credenciales.

Ahora es un sitio de 30 páginas indexables (15 por idioma) con páginas por servicio, casos de estudio verificables, FAQ, sobre nosotros, contacto y privacidad; datos estructurados que conectan organización, fundador, servicios y productos; política explícita para crawlers de IA y `llms.txt`; y una suite de 32 pruebas automáticas más Lighthouse reproducible. Todo el contenido ficticio se eliminó.

## Cambios implementados

**Contenido y veracidad**
- Eliminada la sección "Antes y después" (Acme, Lorem ipsum, métricas sin fuente), el badge "Q2 / Q3 2026", la tarjeta "Caso 03 / Coming soon", la estadística "70 %" y las promesas de puntaje sin medición.
- Chatbot guionado reemplazado por un panel de contacto rápido con canales reales (WhatsApp, email, formulario).
- Casos de estudio con relación real (producto propio / cliente), estado real y stack tomado de los repositorios. Markish Box figura como "en desarrollo".
- Stack público limitado a tecnologías con evidencia en los repos.
- Aviso de privacidad factual (Ley 25.326) enlazado desde el formulario.

**SEO**
- 5 páginas de servicio sin canibalización, hub de servicios, hub y 3 casos de proyectos, sobre nosotros, FAQ, contacto, privacidad, 404 con marca (`noindex`).
- Títulos y descripciones únicos, canonical autorreferentes, un H1 por página, encabezados reales en tarjetas.
- `sitemap.xml` generado con hreflang; `robots.txt` generado; `sitemap-index.xml` conservado.
- Logo y migas enlazan al inicio del idioma actual (antes `/` → 301 → `/es` también desde inglés).
- Redirección de `/x/index.html` a `/x`.

**SEO internacional**: slugs traducidos, hreflang `es-AR`/`en-US`/`x-default` recíproco y consistente entre HTML y sitemap, selector de idioma a la página equivalente, manifest por idioma, sin `fallback` que generaba 404 genéricos.

**Datos estructurados**: grafo único por página con Organization, Person (fundador + LinkedIn), WebSite, WebPage/CollectionPage/AboutPage/ContactPage/FAQPage, BreadcrumbList, Service, SoftwareApplication y WebSite (cliente). Ver [structured-data.md](../seo/structured-data.md).

**GEO**: contenido completo sin JavaScript, resúmenes citables, `llms.txt` y `llms-full.txt` generados desde las colecciones, `robots.txt` con 12 tokens de crawlers de IA verificados en la documentación de cada empresa, metodología y planilla de medición. Ver [ai-discoverability.md](../geo/ai-discoverability.md).

**AEO**: 15 preguntas generales y 3–4 por servicio, en ambos idiomas, sin precios ni plazos inventados. Ver [answer-optimization.md](../aeo/answer-optimization.md).

**Performance**: CSS inline, fuentes autoalojadas, hero 3D diferido y con condiciones por dispositivo, hero sin animación de entrada, imágenes AVIF/WebP, caché `immutable` corregida, dependencias sin uso eliminadas (`motion`, `resend`, `@react-three/drei`, `react-hook-form`, `@astrojs/sitemap`).

**Accesibilidad**: foco visible con `outline` en todos los controles (antes los botones primarios no mostraban foco), skip link que mueve el foco, menú móvil con focus trap e `inert`, panel de contacto con gestión de foco, toggle de tema que respeta la preferencia del sistema y nombra la acción, contraste corregido en tema claro, nombres accesibles del selector de idioma, enlaces subrayados dentro de texto, canales de contacto como enlaces reales, HUD decorativo oculto a lectores, strings en inglés dentro del español traducidos.

**Best practices y seguridad**: CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP; `noopener` verificado en todos los enlaces externos; API de contacto con honeypot y sin respuestas de éxito falsas; `npm audit fix` sin cambios mayores (34 → 10 vulnerabilidades).

**UX/conversión**: propuesta en el H1 ("Desarrollo web y software a medida para negocios que quieren crecer"), CTA principal a contacto y secundario a proyectos, navegación por páginas en vez de 8 anclas, cada problema enlaza a su servicio, cada caso a su página y al sitio real, CTA al final de cada página interna.

**Testing**: Playwright + axe + Lighthouse sobre el build de producción. Ver [quality-gates.md](../testing/quality-gates.md).

## Lighthouse

| Página | Dispositivo | Perf antes → después | A11y | BP | SEO |
| --- | --- | --- | --- | --- | --- |
| `/es` | mobile | 91 → 100 | 100 → 100 | 100 → 100 | 100 → 100 |
| `/en` | mobile | 91 → 99 | 100 → 100 | 100 → 100 | 100 → 100 |
| `/es` | desktop | 99 → 100 | 100 → 100 | 100 → 100 | 100 → 100 |
| `/en` | desktop | 99 → 100 | 100 → 100 | 100 → 100 | 100 → 100 |
| 14 páginas nuevas | mobile | N/D → 100 (12) / 99 (2 casos) | N/D → 100 | N/D → 100 | N/D → 100 |
| 14 páginas nuevas | desktop | N/D → 100 | N/D → 100 | N/D → 100 | N/D → 100 |

Antes: producción. Después: build de producción local. Detalle, condiciones y explicación de los 99 en [lighthouse-results.md](../performance/lighthouse-results.md).

## Resultados técnicos

| Métrica (laboratorio, mobile, home) | Antes | Después |
| --- | --- | --- |
| FCP | 2,8 s | 1,4 s |
| LCP | 2,77 s | 1,66 s |
| TBT | 92 ms | 0 ms |
| CLS | 0,006 | 0 |
| JS en carga inicial | ≈ 23 KB raw propios + 3D (248 KB br) descargado dentro de la traza de Lighthouse | ≈ 7 KB br; 3D fuera de la carga inicial |

INP: sin datos de campo todavía. Rutas auditadas: 18 con Lighthouse (todas las plantillas en ambos idiomas) y las 30 del sitemap con Playwright y axe.

**Pruebas**: `astro check` 0 errores / 0 warnings; build sin errores; 32/32 pruebas de Playwright pasando (axe sin violaciones en tema oscuro y claro en las 30 páginas, 0 enlaces internos rotos, 0 errores de consola, sin desborde horizontal a 320/768/1280 px).

## Seguridad de dependencias

Actualización posterior (rama `chore/update-dependencies`): **0 vulnerabilidades** según `npm audit`.

- Astro 6.4 → 7.4, `@astrojs/vercel` 10 → 11, `@astrojs/react` 5 → 7, `@vitejs/plugin-react` 5 → 6, `sharp` 0.34 → 0.35, `three` 0.184 → 0.186 y el resto a su última versión. Sin cambios de código necesarios para Astro 7.
- `patch-package` se reemplazó por `scripts/patch-r3f-clock.mjs` (mismo cambio en `@react-three/fiber`, sin dependencias): su árbol arrastraba `braces` ≤3.0.3, que no tiene versión corregida publicada.
- `overrides` en `package.json`: `path-to-regexp` 6.3.0 dentro de `@vercel/routing-utils` (ReDoS en 6.1.0) y `esbuild` ^0.28.2.
- TypeScript queda en 6.x: `@astrojs/check` solo soporta TypeScript 5 y 6. Subir a 7 cuando `@astrojs/check` lo soporte.
- Node.js mínimo: 22.22 (requisito de Astro 7).

## Actualización: consola limpia y menos JavaScript

Reportado por el dueño en producción: `[Violation] Forced reflow`, `[Violation] 'requestAnimationFrame' handler took 113ms` y dos errores 404 de `/_vercel/insights/script.js`.

- **Reflows forzados**: el script del header leía `scrollY` mientras la página se parseaba (18 ms) y Lenis medía la ventana en momentos arbitrarios (hasta 62 ms en producción). Se quitó Lenis: el scroll es nativo, las anclas usan `scroll-behavior: smooth` de CSS (desactivado con movimiento reducido) y la barra de progreso y el parallax toman las medidas de `ResizeObserver` sin lecturas sincrónicas. Se pierde la inercia suave de la rueda en desktop. Test: `tests/performance.spec.ts`.
- **Frame de 113 ms del 3D**: era la compilación sincrónica de shaders en el primer frame. La escena se reescribió en three.js puro (`src/components/three/hero-scene.ts`) con `compileAsync()` antes del primer frame y fade-in. Se eliminaron React, React DOM, `@react-three/fiber`, `@astrojs/react`, `@vitejs/plugin-react` y el script que corregía `THREE.Clock` en fiber (three puro usa `Timer`).
- **404 de Analytics**: el script de Vercel Web Analytics solo existe cuando Analytics está activado en el proyecto. El dueño lo activó en el dashboard el 2026-10-18 y el script volvió a incluirse en el build.

## Pendientes

**Requieren credenciales o acceso del dueño**
- Vercel Web Analytics: activado. Eventos personalizados (clics a WhatsApp, envíos) requieren plan Pro.
- Verificar el dominio en Google Search Console y Bing Webmaster Tools y enviar `/sitemap.xml`.
- Confirmar que `GMAIL_USER` y `GMAIL_APP_PASSWORD` están configurados en Vercel (si no, el formulario ahora responde error en vez de perder el mensaje).

**Validaciones que requieren producción o preview**
- Que Vercel use `npm run build` (fijado en `vercel.json`) y que los headers de caché y seguridad aparezcan en respuestas reales.
- Re-medir Lighthouse sobre el preview (incluye el script real de analytics).
- Rich Results Test y Schema Markup Validator sobre URLs públicas.
- Probar el formulario de punta a punta (envío real de email).

**Contenido que requiere información real**
- Bio ampliada y foto del fundador; perfiles oficiales de la marca (LinkedIn empresa, GitHub, etc.) para `sameAs`.
- Nombre del cliente de FORJA Challenge, autorización y testimonio.
- Métricas verificables de los productos, si se quieren publicar.
- Disponibilidad real para el hero; confirmación de herramientas no verificadas (n8n, Zapier, Stripe…); decisión sobre publicar rangos de precio.
- Revisión legal del aviso de privacidad.
- Redacción de los artículos del blog (8 borradores con estructura).
- Corregir en markishbox.com.ar las cifras "+60 boxes / 99,97 % uptime" si no son reales.

**Fuera del repositorio**: ver [offsite-opportunities.md](../seo/offsite-opportunities.md).

## Siguientes pasos (por impacto)

1. Deploy de preview → verificar headers, formulario y Lighthouse → merge.
2. Search Console + Bing: verificar y enviar sitemap; pedir indexación de las páginas nuevas.
3. Página de empresa en LinkedIn y enlaces "Desarrollado por Markish Tech" desde Arena, Box y (con permiso) FORJA.
4. Completar bio del fundador y testimonio de FORJA.
5. Publicar los primeros 2–3 artículos con experiencia real (Astro vs Next.js, Core Web Vitals con los datos de este proyecto, SaaS multi-tenant).
6. CI en GitHub Actions con `npm run validate`.
7. Migración a Astro 7 / adapter 11 y CSP con hashes.
8. Medición mensual de visibilidad en IA con la planilla de `docs/geo/`.
