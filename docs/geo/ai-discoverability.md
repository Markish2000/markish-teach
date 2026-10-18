# Visibilidad en buscadores con IA (GEO)

Objetivo: que los asistentes y buscadores con IA puedan encontrar Markish Tech, entender qué es, verificar su identidad y citar páginas concretas. Nada de esto garantiza aparecer en una respuesta: los modelos deciden con criterios propios y no públicos.

## Qué se implementó

| Área | Implementación |
| --- | --- |
| Contenido rastreable sin JS | Todo el texto está en el HTML estático. Los crawlers de IA en general no ejecutan JavaScript |
| Entidad clara | `Organization` + `Person` (fundador) + `WebSite` con `@id` estables en todas las páginas; nombre "Markish Tech" idéntico en todo el sitio |
| Páginas citables | Cada servicio y cada caso abre con un resumen de 2–4 oraciones que se entiende solo; secciones con encabezados descriptivos (qué es, para quién, cuándo no conviene) |
| Preguntas y respuestas | FAQ general (15 preguntas) + 3–4 preguntas por servicio. Ver `docs/aeo/answer-optimization.md` |
| Afirmaciones verificables | Cada caso enlaza al sitio público del proyecto; los stacks salen de los repositorios reales; no hay métricas sin evidencia |
| `llms.txt` / `llms-full.txt` | Generados en build desde las mismas colecciones que las páginas (`src/lib/llms.ts`), así que no se desactualizan |
| Política de crawlers | `robots.txt` explícito (abajo) |

## Política de crawlers (decisión del dueño: permitir búsqueda y entrenamiento)

Tokens verificados en la documentación oficial de cada empresa (octubre 2026):

| Empresa | Token | Uso | Fuente |
| --- | --- | --- | --- |
| OpenAI | `OAI-SearchBot` | Búsqueda en ChatGPT | developers.openai.com/api/docs/bots |
| OpenAI | `ChatGPT-User` | Visitas pedidas por un usuario (puede no respetar robots.txt) | ídem |
| OpenAI | `GPTBot` | Entrenamiento | ídem |
| Anthropic | `Claude-SearchBot` | Búsqueda | support.claude.com, artículo 8896518 |
| Anthropic | `Claude-User` | Visitas pedidas por un usuario | ídem |
| Anthropic | `ClaudeBot` | Entrenamiento | ídem |
| Perplexity | `PerplexityBot` | Búsqueda (no entrenamiento, según Perplexity) | docs.perplexity.ai/guides/bots |
| Perplexity | `Perplexity-User` | Visitas pedidas por un usuario | ídem |
| Google | `Google-Extended` | Token de control para entrenamiento y grounding de Gemini; no afecta Google Search | developers.google.com/search/docs/crawling-indexing/google-common-crawlers |
| Apple | `Applebot` / `Applebot-Extended` | Búsqueda de Apple / control de entrenamiento | support.apple.com/119829 |
| Common Crawl | `CCBot` | Dataset abierto usado por muchos modelos | — |

Bloquear un bot de entrenamiento no impide aparecer en la búsqueda de esa misma empresa (los tokens de búsqueda son distintos). Si el dueño cambia de idea, basta con mover los tokens de entrenamiento (`GPTBot`, `ClaudeBot`, `Google-Extended`, `Applebot-Extended`, `CCBot`) a un grupo `Disallow: /` en `src/pages/robots.txt.ts`.

Vercel no tiene protección anti-bots activa en este proyecto (el HTML responde 200 a `curl`). Si en el futuro se activa "Bot Protection" o un firewall, hay que verificar que no bloquee estos crawlers.

## Indicadores propios (no existe un "GEO score" oficial)

Medir mensualmente y registrar en `docs/geo/ai-visibility-log.csv`:

1. **Presencia en respuestas**: para cada consulta de la lista, si Markish Tech aparece (sí/no) y en qué posición o contexto.
2. **Citas**: URL del sitio citada, si la hay.
3. **Exactitud**: si la descripción de la empresa es correcta (servicios, ubicación, proyectos).
4. **Competidores mencionados** en la misma respuesta.
5. **Tráfico de referencia** desde `chatgpt.com`, `perplexity.ai`, `copilot.microsoft.com`, `gemini.google.com` en Vercel Web Analytics.
6. **Accesos de crawlers de IA** en los logs de Vercel (si el plan lo permite).

### Consultas de prueba

Marca: "¿Qué es Markish Tech?", "Markish Tech desarrollo web Argentina", "¿Quién desarrolló Markish Arena?".

Sin marca: "empresas de desarrollo de software a medida en Argentina", "estudio de desarrollo web en Buenos Aires", "quién puede desarrollar una plataforma SaaS en Argentina", "empresas que trabajen con Astro en Argentina", "desarrollo de aplicaciones para competencias de CrossFit".

### Método

- Sesión nueva, sin historial ni memoria; anotar si la herramienta tenía búsqueda web activada.
- Plataformas: ChatGPT, Gemini, Claude, Perplexity, Copilot.
- Copiar la respuesta textual en una columna de notas; no resumir de memoria.
- No registrar resultados que no se observaron directamente.

## Limitaciones

- No se puede medir desde este repositorio si los modelos ya incorporaron el sitio. Los primeros cambios visibles suelen depender de la reindexación (Search Console / Bing) y de menciones externas.
- La falta de presencia externa (ver `docs/seo/offsite-opportunities.md`) pesa más que cualquier ajuste técnico del sitio.
