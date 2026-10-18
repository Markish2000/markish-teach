# Quality gates

Todas las pruebas corren contra el **build de producción** servido localmente, no contra el servidor de desarrollo.

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run check` / `npm run typecheck` | `astro check`: TypeScript estricto y plantillas Astro |
| `npm run build` | `astro build` + `scripts/vercel-headers.mjs` (caché y headers de seguridad) |
| `npm run preview` | Sirve `.vercel/output/static` en `http://localhost:4321` emulando el router de Vercel |
| `npm test` | Toda la suite de Playwright (levanta el servidor sola si no está corriendo) |
| `npm run test:e2e` | Rutas, enlaces, idiomas, formulario, tema |
| `npm run test:a11y` | axe-core WCAG 2.0/2.1/2.2 A+AA en todas las páginas y ambos temas, más teclado |
| `npm run test:seo` | Metadatos, hreflang, robots, sitemap, llms.txt, JSON-LD, contenido ficticio |
| `npm run test:lighthouse` | Lighthouse real, mobile y desktop, 3 corridas por URL; falla si una mediana < 100 |
| `npm run validate` | check + build + test |

Para auditar otro entorno (preview de Vercel o producción): `BASE_URL=https://... npx playwright test` y `node scripts/lighthouse.mjs --base https://...`. En Git Bash de Windows anteponer `MSYS_NO_PATHCONV=1` al pasar rutas como `/es`.

## Qué cubre cada spec

| Spec | Verifica |
| --- | --- |
| `routes` | Todas las URLs del sitemap: 200, sin errores de consola ni excepciones, sin desborde horizontal a 320/768/1280 px, imágenes sin romper; redirecciones `/`, barra final e `index.html`; 404 con marca y `noindex`; `immutable` en `/_astro` y headers de seguridad |
| `seo` | Título 20–70 y descripción 70–170 únicos; canonical autorreferente; un `h1`; `lang`; Open Graph absoluto; hreflang recíproco con `x-default`; robots.txt; sitemap válido y solo con canónicas 200; llms.txt sin enlaces rotos |
| `schema` | JSON-LD válido, `@id` absolutos y consistentes, referencias resueltas, URLs absolutas, breadcrumbs, entidad principal de servicios y casos, FAQPage igual a lo visible |
| `links` | Todos los enlaces internos de todas las páginas responden 200 sin redirección y sus anclas existen; `target="_blank"` siempre con `noopener` |
| `content` | Sin placeholders ni datos ficticios conocidos; sin palabras del otro idioma; `es.json` y `en.json` con las mismas claves |
| `i18n` | El selector lleva a la página equivalente; los enlaces internos no cruzan de idioma |
| `form` | Errores accesibles y foco en el primer campo inválido; envío con payload correcto (API simulada); éxito anunciado y enfocado; error del servidor visible; enlace a privacidad |
| `theme` | Respeta `prefers-color-scheme`; el toggle cambia, persiste y nombra la acción siguiente |
| `keyboard` | Skip link primero y mueve el foco a `main`; foco visible en los primeros 25 elementos; menú móvil atrapa y devuelve el foco; panel de contacto rápido; FAQ con teclado |
| `a11y` | axe WCAG 2.2 AA en todas las páginas, tema oscuro y claro |
| `performance` | Ningún layout forzado desde JavaScript (el "[Violation] Forced reflow" de la consola) al cargar ni en la primera interacción, a 390, 628 y 1440 px. Usa una traza de rendimiento de Chrome |

`/api/contact` es una función serverless que no existe en el servidor local: los tests la simulan con `page.route`. Vercel Web Analytics tampoco existe localmente; el servidor responde un script vacío en `/_vercel/insights/script.js`.

## Revisión manual pendiente

Lo automatizado cubre reflow a 320 px (equivale al zoom 400 % de una ventana de 1280 px), foco visible en los primeros 25 elementos de la home y los flujos de teclado del menú, contacto rápido, FAQ y formulario. Falta una pasada hecha por una persona:

- Recorrido completo con teclado de cada plantilla (home, servicio, caso, FAQ, contacto, privacidad).
- Lector de pantalla real (NVDA en Windows o VoiceOver en macOS/iOS): formulario, menú móvil, contacto rápido, FAQ.
- Zoom 200 % y 400 % del navegador en escritorio.
- Modo de alto contraste de Windows (el foco usa `outline`, que sí se muestra en ese modo).

## Mantenimiento

- Al agregar una página nueva, si no sale de `SECTIONS` o de una colección, sumarla a `getAllPages()` para que la cubran el sitemap y todos los tests.
- Si se agrega un texto prohibido nuevo (por ejemplo, otro cliente de ejemplo), sumarlo a `FORBIDDEN` en `tests/content.spec.ts`.
- Los reportes quedan en `reports/` (ignorado por git).

## CI recomendado (no configurado)

El repositorio no tiene CI. Un workflow de GitHub Actions que corra `npm ci && npx playwright install --with-deps chromium && npm run validate` en cada pull request bloquearía regresiones antes del deploy de Vercel.
