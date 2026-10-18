# Autoridad externa: situación y acciones pendientes

Nada de esta lista se ejecutó: son acciones fuera del repositorio que dependen del dueño de la marca.

## Situación encontrada (búsquedas del 2026-10-18)

| Búsqueda | Resultado |
| --- | --- |
| `"Markish Tech"` | Ningún resultado de la empresa. Aparecen resultados sobre "Markish Arun" (CTO de Agrizy, India) y empresas con nombres parecidos (MarkiTech, Mark-Tech) |
| `"Markish Arena" OR "Markish Box"` | Ningún resultado propio; solo gimnasios no relacionados |
| Empresas de software a medida en Buenos Aires | Dominan directorios (Develop Argentina, rankings de software houses) y empresas grandes (Globant, etc.) |

Conclusiones:

1. **La marca no tiene presencia externa indexada.** Para buscadores y asistentes de IA, hoy Markish Tech solo existe en su propio sitio, sin terceros que lo confirmen. Es el principal freno para aparecer en recomendaciones.
2. **Riesgo de confusión de entidad** con "Markish Arun". Por eso el JSON-LD usa `@id` estables, nombre consistente y vínculo explícito con el fundador; conviene que todos los perfiles externos usen exactamente "Markish Tech" y enlacen a `https://www.markishtech.com.ar`.
3. **Inconsistencia a corregir**: la landing de `markishbox.com.ar` muestra "+60 boxes en LATAM" y "99,97 % uptime", mientras que el producto está en desarrollo. Si no son datos reales, conviene quitarlos: contradicen el caso de estudio y pueden restar confianza. La captura publicada en este sitio se recortó para no reproducir esas cifras.

## Acciones priorizadas

| Prioridad | Acción | Por qué |
| --- | --- | --- |
| Alta | Crear la página de empresa de **Markish Tech en LinkedIn** con el mismo nombre, URL, descripción y ubicación; vincularla desde el perfil del fundador como experiencia laboral | Señal de entidad más fuerte para B2B; después agregarla a `SOCIAL_PROFILES` |
| Alta | **Google Search Console y Bing Webmaster Tools**: verificar el dominio y enviar `https://www.markishtech.com.ar/sitemap.xml` | Indexación de las páginas nuevas; Bing alimenta a Copilot y a otros asistentes |
| Alta | Enlaces "Desarrollado por Markish Tech" en el pie de **markisharena.com.ar**, **markishbox.com.ar** y, con permiso del cliente, **forjachallenge.com.ar** | Relaciona productos y marca con enlaces reales y verificables |
| Media | **Google Business Profile** solo si hay un domicilio o área de servicio que se pueda declarar con veracidad | Panel de conocimiento local |
| Media | Fichas en directorios legítimos de software (Clutch, GoodFirms, directorios argentinos de software houses) con datos idénticos a los del sitio | Menciones de terceros; algunas plataformas piden reseñas de clientes reales |
| Media | **Testimonio real** del organizador de FORJA Challenge, con nombre y autorización | Prueba social verificable para el caso y la home |
| Media | Perfil público de **GitHub** de la organización con repos o paquetes que se puedan abrir | Evidencia técnica citable |
| Baja | Publicar artículos técnicos propios (ver `content-strategy.md`) y difundirlos en comunidades (dev.to, LinkedIn, meetups como Nerdearla) | Menciones y enlaces naturales |
| Baja | Charlas o posts sobre la construcción de Markish Arena (tiempo real, multi-tenant) | Autoridad temática demostrable |

## Lo que no hay que hacer

- Comprar enlaces, intercambiar enlaces masivamente o publicar en granjas de artículos.
- Crear reseñas o perfiles falsos.
- Usar variantes del nombre ("MarkishTech", "Markish Technologies") en distintos sitios.

## Competidores y patrones observados

Los resultados para búsquedas genéricas los ocupan directorios con páginas de glosario y de precios de referencia, y estudios con páginas por servicio y casos. La arquitectura nueva (páginas por servicio, casos, FAQ) apunta a competir con ese formato sin copiar textos. Publicar rangos de precios es una oportunidad (la FAQ hoy explica factores de costo) si el dueño decide hacerlo.
