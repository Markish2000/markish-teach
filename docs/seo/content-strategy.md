# Arquitectura de contenido y estrategia editorial

## Mapa del sitio

```
/es                              Home: propuesta, servicios, problemas, casos, proceso, stack, calidad, contacto
/es/servicios                    Hub + "¿Cuál necesito?"
  /desarrollo-web                Sitios institucionales, landings, rediseños (Astro / Next.js)
  /software-a-medida             Aplicaciones web, paneles, SaaS multi-tenant
  /seo-tecnico-y-performance     Indexación, datos estructurados, Core Web Vitals, migraciones
  /accesibilidad-web             Auditorías y correcciones WCAG 2.2 AA
  /automatizacion-de-procesos    APIs, webhooks, colas, notificaciones, reportes
/es/proyectos                    Publicados / En desarrollo
  /markish-arena                 Producto propio, en producción
  /forja-challenge               Proyecto para cliente, en producción
  /markish-box                   Producto propio, en desarrollo
/es/sobre-nosotros               Entidad, fundador, experiencia, forma de trabajo
/es/preguntas-frecuentes         15 preguntas en 5 grupos (AEO)
/es/contacto                     Formulario + WhatsApp + email
/es/privacidad                   Aviso de privacidad factual
```

Mismo árbol en `/en` con slugs traducidos.

## Por qué cinco servicios

La home anterior listaba siete "capacidades". Se consolidaron para que cada URL apunte a una intención de búsqueda distinta y no compitan entre sí:

| Página | Intención principal | Absorbe |
| --- | --- | --- |
| Desarrollo web | "desarrollo de sitios web profesionales", "empresa desarrollo web Argentina" | Rediseño |
| Software a medida | "desarrollo de software a medida", "desarrollo plataforma SaaS" | Soluciones digitales |
| SEO técnico y performance | "SEO técnico", "mejorar Core Web Vitals", "migrar sin perder SEO" | Performance |
| Accesibilidad web | "auditoría accesibilidad WCAG" | — |
| Automatización | "automatización de procesos", "integración con APIs" | — |

Cada página de servicio responde en el mismo orden: resumen citable, problemas, para quién es, qué incluye, cómo se implementa, tecnologías, cuándo conviene y cuándo no, casos relacionados, preguntas frecuentes y servicios vecinos.

## Dónde se edita el contenido

| Contenido | Archivo |
| --- | --- |
| Servicios | `src/content/services/{es,en}/*.yaml` |
| Casos | `src/content/projects/{es,en}/*.yaml` (campo `results` vacío hasta tener datos verificables) |
| FAQ general | `src/content/faq/{es,en}.yaml` |
| Textos de UI, home, sobre nosotros, privacidad, SEO de páginas fijas | `src/i18n/{es,en}.json` |
| Blog | `src/content/blog/{locale}/*.md` |

## Blog

La estructura existe pero **no hay artículos publicados**: los ocho archivos de `src/content/blog/es/` tienen `draft: true` y solo un esquema de secciones. Un borrador no genera ruta, ni entra al sitemap ni a `llms.txt`. No se publica índice de blog vacío.

Para publicar uno: redactarlo con experiencia propia y fuentes, poner `draft: false`, completar `pubDate`, y crear la ruta del índice cuando haya al menos tres artículos. Temas preparados:

1. Astro vs Next.js para sitios empresariales
2. Cuándo conviene desarrollar software a medida
3. Cómo mejorar las Core Web Vitals (usar las mediciones reales de `docs/performance/`)
4. Qué es una arquitectura SaaS multi-tenant (experiencia de Arena y Box)
5. Cómo mejorar el SEO técnico de una aplicación web
6. Cómo modernizar un frontend legacy
7. Qué es una arquitectura de micro-frontends
8. Cómo elegir tecnologías para aplicaciones empresariales

## Reglas editoriales

- Ninguna cifra, cliente, testimonio o resultado sin evidencia. `tests/content.spec.ts` bloquea los placeholders conocidos (Acme, Lorem ipsum, "Coming soon", trimestres de disponibilidad, "En línea", porcentajes sin fuente).
- Explicar también cuándo **no** conviene un servicio.
- Cada servicio y caso empieza con un resumen de 2–4 oraciones que se entiende sin leer el resto (útil para fragmentos destacados y respuestas de IA).
- "Markish Tech" siempre escrito igual.

## Pendiente de información real

- Bio ampliada del fundador (formación, trayectoria, años de experiencia) y foto.
- Nombre del cliente de FORJA Challenge y autorización para citarlo; testimonio si lo autoriza.
- Métricas verificables de Arena (eventos realizados, usuarios) si se quieren publicar.
- Confirmar si se ofrecen herramientas no verificadas en los repos (n8n, Zapier, Stripe, Supabase, Sanity, Cloudflare); se quitaron del sitio hasta confirmarlo.
- Disponibilidad real para mostrar en el hero (se quitó "Q2 / Q3 2026").
