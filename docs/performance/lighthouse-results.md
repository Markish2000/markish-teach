# Resultados de Lighthouse

## Condiciones

| | Baseline | Final |
| --- | --- | --- |
| Fecha | 2026-10-18 | 2026-10-18 |
| Herramienta | Lighthouse 13.5.0 (Node API), Chrome headless | ídem |
| URL auditada | Producción `https://www.markishtech.com.ar` | Build de producción local (`npm run build` + `npm run preview`, brotli) |
| Throttling | Por defecto de Lighthouse (mobile: Moto G Power, 4G lento simulado, CPU ×4; desktop: preset desktop) | ídem |
| Corridas | 3 por URL y dispositivo, se reporta la mediana | ídem |
| Script | `node scripts/lighthouse.mjs` | ídem |

Son **mediciones de laboratorio**, no datos de usuarios reales. Los datos reales (Core Web Vitals de campo, incluido INP) estarán en Search Console / CrUX y en Vercel cuando el sitio nuevo reciba tráfico; hoy no hay datos de campo disponibles.

El build local no carga el script real de Vercel Web Analytics (solo existe en Vercel); el servidor local devuelve un script vacío en esa ruta. El script real es pequeño y se carga diferido, pero la cifra de producción puede diferir levemente: **re-medir sobre el deploy de preview** con `node scripts/lighthouse.mjs --base https://<preview>.vercel.app`.

## Antes / después (mediana de 3 corridas)

Rendimiento · Accesibilidad · Buenas prácticas · SEO

| Página | Dispositivo | Antes | Después | LCP antes → después | TBT antes → después |
| --- | --- | --- | --- | --- | --- |
| `/es` | mobile | 91 · 100 · 100 · 100 | **100 · 100 · 100 · 100** | 2,77 s → 1,66 s | 92 ms → 0 ms |
| `/en` | mobile | 91 · 100 · 100 · 100 | **99** · 100 · 100 · 100 | 2,77 s → 1,66 s | 64 ms → 0 ms |
| `/es` | desktop | 99 · 100 · 100 · 100 | **100 · 100 · 100 · 100** | 0,75 s → 0,42 s | 0 → 0 |
| `/en` | desktop | 99 · 100 · 100 · 100 | **100 · 100 · 100 · 100** | 0,75 s → 0,42 s | 0 → 0 |

Las demás páginas no existían antes (N/D). Resultado final:

| Página | Mobile | LCP | Desktop | LCP |
| --- | --- | --- | --- | --- |
| `/es/servicios`, `/en/services` | 100 · 100 · 100 · 100 | 1,67 s | 100 · 100 · 100 · 100 | 0,38 s |
| `/es/servicios/software-a-medida`, `/en/services/custom-software` | 100 · 100 · 100 · 100 | 1,67 s | 100 · 100 · 100 · 100 | 0,39 s |
| `/es/proyectos`, `/en/projects` | 100 · 100 · 100 · 100 | 1,73 s | 100 · 100 · 100 · 100 | 0,39 s |
| `/es/proyectos/markish-arena` | **99** · 100 · 100 · 100 | 1,83 s | 100 · 100 · 100 · 100 | 0,43 s |
| `/en/projects/markish-box` | **99** · 100 · 100 · 100 | 1,81 s | 100 · 100 · 100 · 100 | 0,41 s |
| `/es/sobre-nosotros`, `/en/about` | 100 · 100 · 100 · 100 | 1,67 s | 100 · 100 · 100 · 100 | 0,38 s |
| `/es/preguntas-frecuentes`, `/en/faq` | 100 · 100 · 100 · 100 | 1,67 s | 100 · 100 · 100 · 100 | 0,38 s |
| `/es/contacto`, `/en/contact` | 100 · 100 · 100 · 100 | 1,67 s | 100 · 100 · 100 · 100 | 0,38 s |
| `/es/privacidad`, `/en/privacy` | 100 · 100 · 100 · 100 | 1,67 s | 100 · 100 · 100 · 100 | 0,37 s |

CLS 0,000 en todas las páginas y dispositivos. Detalle por corrida en `reports/lighthouse/final/summary.json` (no versionado).

## Puntajes que no llegan a 100

**`/en` mobile — 99 (corridas: 99, 99, 99; en una medición previa de 5 corridas: 100, 100, 99, 99, 100).** Mismas métricas que `/es` (LCP 1,66 s, TBT 0, CLS 0): está justo en el borde entre 99 y 100 y la diferencia es ruido de medición, no un problema de código.

**Casos de estudio mobile — 99 (las tres corridas).**
- Causa: el LCP (1,81–1,83 s) es el texto del encabezado, que se vuelve a pintar cuando termina de cargar la tipografía Space Grotesk (`font-display: swap`). El resto de las páginas tiene el mismo patrón pero un LCP apenas menor.
- Ya aplicado: fuente variable autoalojada de 23 KB, subset latino, `preload`, métricas de fallback ajustadas (sin salto de layout), captura en AVIF con `fetchpriority="high"` y `sizes` correcto.
- Alternativa descartada: `font-display: optional` llevaría el puntaje a 100, pero en conexiones lentas la primera visita se vería sin la tipografía de la marca. Es un cambio de diseño para ganar un punto de laboratorio.
- Impacto: ninguno práctico. 1,8 s está muy por debajo del umbral "bueno" de LCP (2,5 s).

## Actualización: sin React ni Lenis (2026-10-18)

Mediciones posteriores con el mismo método, después de reescribir el hero 3D en three.js puro, quitar React/React DOM/R3F y Lenis, y actualizar a Astro 7:

| Página | Mobile | LCP | Desktop |
| --- | --- | --- | --- |
| `/es` | 100 · 100 · 100 · 100 | 1,58 s | 100 · 100 · 100 · 100 |
| `/en` | 100 · 100 · 100 · 100 | 1,58 s | 100 · 100 · 100 · 100 |
| `/es/servicios/software-a-medida` | 100 · 100 · 100 · 100 | 1,58 s | 100 · 100 · 100 · 100 |
| `/es/proyectos/markish-arena` | 100 · 100 · 100 · 100 | 1,66 s | 100 · 100 · 100 · 100 |
| `/en/faq` | 100 · 100 · 100 · 100 | 1,43 s | 100 · 100 · 100 · 100 |

Montaje del hero 3D (Chrome, desktop, primera visita): frame más largo 110 ms → 14 ms y tareas largas 3 → 1, gracias a `renderer.compileAsync()`. JS del 3D: 248 KB → 110 KB (brotli). JS inicial propio: ≈ 21 KB → 3 KB sin comprimir. Las secciones de abajo describen la versión anterior a esta actualización.

## Qué cambió para llegar acá

1. **CSS inline** (`build.inlineStylesheets: "always"`): elimina el CSS bloqueante (FCP mobile 2,8 s → 1,4 s).
2. **Fuentes autoalojadas** con la API de fuentes de Astro: sin conexiones a Google Fonts, dos archivos variables (23 KB y 31 KB), fallbacks con métricas ajustadas.
3. **Hero 3D (three.js, ~250 KB br)**: se carga solo después de `load`, con el hero visible y el navegador ocioso; en pantallas táctiles o de hasta 1024 px espera la primera interacción; nunca carga con movimiento reducido, ahorro de datos, poca memoria o pocos núcleos. TBT mobile 92 ms → 0.
4. **Hero sin animación de entrada**: el H1 se pinta en el primer frame y pasa a ser el elemento LCP (antes lo era el logo, porque el texto arrancaba con opacidad 0).
5. **Imágenes** con `<Picture>` AVIF + WebP y `srcset`; captura de caso como LCP con prioridad alta.
6. **Caché `immutable`** para `/_astro/*` (en producción tenía `max-age=0` por un orden de rutas del adapter). No afecta Lighthouse en primera visita, sí a visitas repetidas.

## Peso de la home (build final)

| Recurso | Brotli |
| --- | --- |
| HTML con CSS inline | 21 KB |
| JS inicial (layout + hero + inline) | ≈ 7 KB |
| Fuentes | 22 KB + 31 KB |
| JS del 3D (diferido, no en carga inicial) | 49 KB (React) + 199 KB (three.js) |
