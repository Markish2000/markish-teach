# Datos estructurados (JSON-LD)

Cada página publica **un único** bloque `<script type="application/ld+json">` con un `@graph`. Lo arma `getJsonLd()` en `src/shared/helpers/seo.helpers.ts`; las páginas solo aportan sus nodos propios.

## Entidades globales (todas las páginas, mismos `@id`)

| `@id` | Tipo | Contenido verificado |
| --- | --- | --- |
| `https://www.markishtech.com.ar/#organization` | `Organization` | Nombre, URL, descripción, email, teléfono (WhatsApp), logo, dirección (Buenos Aires, AR), `areaServed` Argentina, idiomas, `knowsAbout`, `founder`, `contactPoint` |
| `https://www.markishtech.com.ar/#founder` | `Person` | Marcos Hernán Parella, `jobTitle`, `worksFor`, `sameAs` LinkedIn |
| `https://www.markishtech.com.ar/#website` | `WebSite` | Nombre, idiomas, `publisher` |

`sameAs` de la organización queda vacío hasta que existan perfiles oficiales de la marca (`SOCIAL_PROFILES` en `src/shared/constants/site.constants.ts`). Se eliminó el nodo `ProfessionalService` anterior: duplicaba a `Organization` y es un subtipo de `LocalBusiness`, pensado para negocios con atención presencial.

## Nodos por página

| Página | Nodo de página | Nodos extra |
| --- | --- | --- |
| Home | `WebPage` (`about` → organización) | — |
| Servicios (índice) | `CollectionPage` con `ItemList` | — |
| Servicio | `WebPage` (`mainEntity` → servicio) | `Service` (`provider`, `areaServed`, `serviceType`) |
| Proyectos (índice) | `CollectionPage` con `ItemList` | — |
| Caso propio (Arena, Box) | `WebPage` | `SoftwareApplication` (`creator`/`publisher` = organización, `applicationCategory: BusinessApplication`; Box con `creativeWorkStatus: "In development"`) |
| Caso cliente (FORJA) | `WebPage` | `WebSite` del cliente con `creator` = organización |
| Sobre nosotros | `AboutPage` (`mainEntity` → organización) | — |
| FAQ | `FAQPage` con `Question`/`Answer` iguales a las visibles | — |
| Contacto | `ContactPage` | — |
| Artículo (cuando se publique) | `WebPage` | `BlogPosting` (autor = fundador, editor = organización, fechas reales) |

Todas las páginas internas incluyen `BreadcrumbList`, igual a las migas visibles.

## Lo que no se publica a propósito

- Sin `AggregateRating`, `Review`, `Offer` ni precios: no hay datos reales.
- Sin cantidades de usuarios, clientes o métricas de proyectos.
- El cliente de FORJA no se nombra como `Organization` hasta tener su autorización.

## Rich results

Un schema válido no garantiza resultados enriquecidos. En particular, Google limita desde 2023 los resultados enriquecidos de `FAQPage` a sitios de gobierno y salud: aquí el valor del `FAQPage` es semántico (buscadores y asistentes de IA), no visual.

## Validación

- Automática: `tests/schema.spec.ts` comprueba en todas las páginas que el JSON sea válido, que cada `@id` sea absoluto y conserve su tipo entre páginas, que toda referencia `{"@id"}` resuelva dentro del grafo, que las URLs sean absolutas, que haya `BreadcrumbList` en páginas internas y que las preguntas del `FAQPage` coincidan con las visibles.
- Manual (pendiente tras el deploy): pegar URLs en el [Rich Results Test](https://search.google.com/test/rich-results) y el [Schema Markup Validator](https://validator.schema.org/).
