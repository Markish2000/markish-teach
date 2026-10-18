# Baseline — Auditoría inicial (2026-10-18)

Estado del sitio **antes** de cualquier cambio. Fuentes: inspección del repositorio (commit `4277c5e`), `curl` contra producción y mediciones reales con Lighthouse y axe-core.

## Stack

| Pieza | Versión / detalle |
| --- | --- |
| Framework | Astro 6.2.1 (`output: "server"`, páginas con `prerender = true`) |
| Hosting | Vercel vía `@astrojs/vercel` 10.0.6 (deploy desde GitHub) |
| UI | Componentes `.astro` + una isla React manual (`Hero3D`, three.js + R3F) |
| Estilos | Tailwind 4 + `src/styles/global.css` (2366 líneas) |
| i18n | `es` (default) y `en`, `prefixDefaultLocale`, `trailingSlash: "never"`, `fallback: { en: "es" }` |
| Rutas | `/es`, `/en` (landing única) + `POST /api/contact` (nodemailer/Gmail) |
| Tests / CI / docs / analytics | No existen |

## Mediciones

**Lighthouse 13.5.0**, Chrome headless local, 3 corridas por URL (mediana), throttling por defecto de Lighthouse, contra `https://www.markishtech.com.ar`:

| URL | Dispositivo | Perf | A11y | BP | SEO | LCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/es` | mobile | 91 | 100 | 100 | 100 | 2.77 s | 92 ms | 0.006 |
| `/en` | mobile | 91 | 100 | 100 | 100 | 2.77 s | 64 ms | 0.000 |
| `/es` | desktop | 99 | 100 | 100 | 100 | 0.75 s | 0 ms | 0.001 |
| `/en` | desktop | 99 | 100 | 100 | 100 | 0.75 s | 0 ms | 0.001 |

Causas de Performance < 100 (mobile): CSS bloqueante de 45 KB (FCP 2.8 s), elemento LCP = logo del header sin `fetchpriority`, Hero3D (three.js) se descarga y ejecuta dentro de la traza (95 KiB de JS sin usar, main thread 2.4 s).

**axe-core 4 (WCAG 2.0/2.1/2.2 A+AA)** vía Playwright sobre `/es` y `/en`:
- Tema oscuro: 0 violaciones automáticas.
- Tema claro: `color-contrast` (serious) en `.stat .unit` del hero y `.ba-stat .delta` de "Antes y después".

Lighthouse Accessibility 100 **no** implica cumplimiento WCAG: la revisión manual encontró problemas que las herramientas no detectan (abajo).

## Hallazgos

Severidad: **C** crítica · **A** alta · **M** media · **B** baja.

### Veracidad y confianza
| Sev | Hallazgo | Evidencia | Acción |
| --- | --- | --- | --- |
| C | "Antes y después" rotulado "Comparativa real" con cliente ficticio "Acme Corp", Lorem ipsum y métricas inventadas (42→98, ×3.4); la 4.ª tile del mock muestra "?" | `BeforeAfter.astro:30,33`, `BeforeAfterSlider.astro:48`, `es.json:56-69` | Eliminar sección |
| A | Badge "Tomando proyectos · Q2 / Q3 2026" vencido | `es.json:15` | Quitar |
| A | Tarjeta placeholder "Caso 03 / Coming soon" (en inglés dentro de ES) | `es.json:135`, `Cases.astro:83` | Eliminar |
| A | Chatbot guionado con estado "En línea" y texto "Esto es un demo de chat" | `es.json:208,220` | Reemplazar por atajos reales |
| M | Estadística sin fuente "El 70% de tu tráfico se va frustrado" | `es.json:51` | Quitar |
| M | Promesas "100/100 Lighthouse", "<1.5s", "24/7", "Lighthouse 95+", "Carga sub-segundo" contradictorias y sin medición | `es.json:22-27,36,161-164`, `Hero.astro:64-85` | Reemplazar por objetivos y mediciones reales |
| M | "Respuesta en 24h" vs "informe en 48h" | `es.json:185,193,219` | Unificar |
| M | Sin política de privacidad pese a recolectar nombre/email/mensaje | sin página | Aviso factual |
| A | `/api/contact` responde `200 {ok:true}` en producción si faltan credenciales SMTP → leads perdidos en silencio | `src/pages/api/contact.ts` | 500 fuera de dev |

### SEO e indexabilidad
| Sev | Hallazgo | Evidencia | Acción |
| --- | --- | --- | --- |
| A | Una sola URL indexable por idioma: imposible posicionar servicios, proyectos o preguntas | sitemap con 2 URLs | Arquitectura de páginas |
| A | Logo enlaza a `/` (301 → `/es`): desde `/en` lleva al español | `Brand.astro` | `/${locale}` |
| M | hreflang `es`/`en` en HTML vs `es-AR`/`en-US` en sitemap | `seo.helpers.ts`, sitemap | Unificar |
| M | 404 inconsistentes: vacíos para la mayoría, página por defecto de Astro (`lang="en"`, sin marca) para `/es/*` por `fallback` | curl | `404.astro` propio, quitar `fallback` |
| B | `/es/index.html` y `/en/index.html` responden 200 (duplicado; canonical lo mitiga) | curl | Documentado |
| M | JSON-LD sin `sameAs`, sin `Person`, `ProfessionalService` duplicando a `Organization`, `primaryImageOfPage` = logo | HTML prod | Rehacer grafo |
| B | Sin `llms.txt`; robots.txt sin política explícita para bots de IA | curl | Implementar |

### Performance y headers
| Sev | Hallazgo | Evidencia | Acción |
| --- | --- | --- | --- |
| A | `/_astro/*` (assets con hash) servidos con `max-age=0`: el adapter coloca la regla `immutable` después de `handle: filesystem`, fase que solo aplica cuando el archivo no existe | `.vercel/output/config.json`, docs Build Output API | Post-build que la mueve antes de `filesystem` |
| M | Sin `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors`/CSP | curl | Agregar |
| M | Google Fonts externo: 5 pesos de Space Grotesk + 2 de JetBrains Mono | `BaseLayout.astro` | Self-host + subset |
| M | Hero3D (three.js 896 KB / 248 KB br) entra en la carga inicial tras 1.2 s | `Hero.astro` | Diferir más, gating por dispositivo |
| B | Código muerto: 6 `.tsx` sin uso, deps `motion`, `resend`, `@react-three/drei`, `react-hook-form`; 4 imágenes sin uso | grep | Eliminar |

### Accesibilidad (revisión manual)
| Sev | Hallazgo | Evidencia |
| --- | --- | --- |
| A | `.btn-primary` sin foco visible: su `box-shadow` pisa el anillo global y la regla base usa `outline: none` (invisible en alto contraste) | `global.css:147-151, 422-429` |
| M | Menú móvil `aria-modal` sin focus trap; panel de chat no mueve el foco | `Header.astro`, `Chatbot.astro` |
| M | HUD decorativo del hero en inglés expuesto a lectores de pantalla | `Hero.astro:64-85` |
| M | Contraste roto en tema claro (mock "after" con fondo oscuro fijo y texto `var(--ink)`) | `BeforeAfterSlider.astro:55-71` |
| B | `role="img"` + alt duplicado en tarjetas de casos; títulos de casos/problemas como `div` | `Cases.astro`, `Problems.astro` |
| B | Toggle de tema ignora `prefers-color-scheme` y `aria-pressed` no describe estado | `theme-bootstrap.ts`, `ThemeToggle.astro` |
| B | Strings en inglés en ES ("FEATURED", "Discovery", "Performance", aria-labels "Primary"/"Language") | `es.json`, `Header.astro`, `LangSwitch.astro` |
| B | Email/WhatsApp como texto plano, no enlaces | `Contact.astro:36-41` |

### Seguridad de dependencias (`npm audit`)
34 vulnerabilidades iniciales. `npm audit fix` (sin cambios mayores) las redujo a 10 y subió Astro a 6.4.8 y el adapter a 10.0.8. Las restantes requieren majors (Astro 7, `@astrojs/vercel` 11, `sharp` 0.35, `patch-package` 6). Análisis de impacto en `docs/audits/final-report.md`.
