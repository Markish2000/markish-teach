# Optimización para motores de respuesta (AEO)

Las preguntas que hacen los potenciales clientes tienen una respuesta directa en el sitio, en HTML estático, con enlace al servicio o caso que la amplía.

## Dónde están las respuestas

| Pregunta | Página | Enlaza a |
| --- | --- | --- |
| ¿Qué es Markish Tech? | FAQ | Sobre nosotros, Proyectos |
| ¿Markish Tech desarrolla software empresarial? | FAQ | Software a medida |
| ¿Qué tecnologías utiliza Markish Tech? | FAQ | — |
| ¿Trabajan con clientes fuera de Argentina? | FAQ | Contacto |
| ¿Cuánto cuesta desarrollar una página web en Argentina? | FAQ | Desarrollo web, Contacto |
| ¿Cuánto demora desarrollar una web profesional? | FAQ | — |
| ¿Cuánto cuesta mantener una aplicación web? | FAQ | — |
| ¿Qué diferencias hay entre Astro, React y Next.js? | FAQ, Desarrollo web | Desarrollo web |
| ¿Se puede conectar una aplicación con APIs externas? | FAQ, Software a medida, Automatización | Automatización |
| ¿Cómo se desarrolla una plataforma escalable? | FAQ, Software a medida | Software a medida |
| ¿Qué es el desarrollo de software a medida? | FAQ, Software a medida | Software a medida |
| ¿Qué empresa puede desarrollar una aplicación SaaS? | FAQ | Casos Arena y Box |
| ¿Cuándo conviene un freelance o una empresa? | FAQ | — |
| ¿Cómo modernizar un sitio sin perder posicionamiento? | FAQ, SEO técnico, Desarrollo web | SEO técnico |
| ¿Qué son las Core Web Vitals? | FAQ, SEO técnico | SEO técnico |
| ¿Qué significa multi-tenant? | Software a medida | — |
| ¿Garantizan el primer puesto en Google? | SEO técnico | — |
| ¿Lighthouse 100 asegura buen posicionamiento / accesibilidad? | SEO técnico, Accesibilidad | — |
| ¿Qué es WCAG 2.2 AA? ¿Sirven los widgets de accesibilidad? | Accesibilidad | — |
| ¿Qué procesos conviene automatizar? ¿Qué pasa si falla? | Automatización | — |

Todas las preguntas existen en español e inglés.

## Criterios de redacción

- La primera oración responde la pregunta; el resto agrega contexto.
- Sin precios ni plazos inventados: las preguntas de costo y tiempo explican los factores que los determinan y por qué no se publican cifras fijas. Si el dueño decide publicar rangos reales, se agregan en `src/content/faq/*.yaml`.
- Ejemplos solo de proyectos reales (este sitio en Astro, Arena con Next.js, etc.).
- Respuestas honestas cuando la respuesta es "no" (garantías de posicionamiento, widgets de accesibilidad).

## Implementación

- Componente `FaqList` con `<details>`/`<summary>` nativos: funciona con teclado y lector de pantalla sin JavaScript, y las respuestas están en el HTML aunque estén plegadas.
- `FAQPage` en JSON-LD solo en la página de preguntas frecuentes, con las mismas preguntas visibles (verificado por test). Google limita los resultados enriquecidos de FAQ a sitios de gobierno y salud, así que el beneficio esperado es de comprensión semántica, no un fragmento enriquecido.
- Las mismas respuestas alimentan `llms-full.txt`.

## Cómo agregar una pregunta

1. Agregarla en `src/content/faq/es.yaml` y `src/content/faq/en.yaml` (mismo `id` conceptual y misma posición), con `links` a servicios (`to: service`, `key`) o proyectos (`to: project`, `key`).
2. `npm run build && npm run test:seo`.
