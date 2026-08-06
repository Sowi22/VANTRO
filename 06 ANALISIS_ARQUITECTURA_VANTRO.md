# VANTRO — Análisis de Arquitectura y Plan de Desarrollo
**Preparado por:** Claude Code, actuando como Lead Software Engineer / Solution Architect / Technical Project Manager
**Basado en:** 0 README, 01 DEVELOPMENT (Development Rules), 02 VANTRO PRD Maestro, 03 VANTRO CMS & Content Bible, 04 PRODUCT DATABASE, 05 VANTRO DEVELOPMENT BIBLE
**Estado:** Pendiente de aprobación. No se ha escrito código de producto.

---

## 1. Comprensión del Proyecto

VANTRO es una empresa de distribución de proteínas (res, pollo, cerdo, hamburguesas, complementos) para restaurantes, comidas rápidas, asaderos, hoteles, catering, clientes fitness y hogares, con operación inicial en Barranquilla y municipios cercanos (Soledad, Puerto Colombia, Malambo, Galapa).

El encargo **no es una landing page**. Es la construcción del **primer activo digital de un ecosistema comercial** que debe:

- Convertir visitantes de Meta Ads en **pedidos confirmados por WhatsApp** en menos de 60 segundos, sin login, sin carrito tradicional, sin pagos en línea en esta versión.
- Adaptar el catálogo automáticamente según el **"Centro de Negocios"** (tipo de negocio del cliente: comidas rápidas, restaurante, asadero, hogar, fitness), en vez de forzar al usuario a navegar un catálogo plano.
- Reemplazar el carrito por un **"Centro de Pedido"**, que arma automáticamente un mensaje de WhatsApp estructurado (productos, cantidades, observaciones, tipo de negocio) para que el asesor comercial nunca tenga que volver a preguntar qué necesita el cliente.
- Transmitir una identidad **premium, tecnológica y ordenada** (referencias: Apple, Stripe, Linear, Notion, Vercel), evitando cualquier estética de "carnicería tradicional".
- Ser **Mobile First** de forma estricta (>90% del tráfico es móvil, diseño base 390px), rápida (LCP <2s, Lighthouse 95+), accesible y con animaciones sutiles que nunca distraigan de la compra.
- Estar **desacoplada de sus propios datos** desde el día uno: ningún producto, precio, categoría o texto puede vivir hardcodeado en un componente. Todo debe salir de una "Base Oficial de Productos" y un "CMS" documentales, que hoy son archivos de configuración TypeScript y mañana serán Supabase / un CMS headless / un Panel Administrativo — sin reescribir la interfaz.
- Prepararse arquitectónicamente (sin construirlos en el MVP) para: Panel Administrativo, CRM, inventario, pagos en línea, automatizaciones, multi-sucursal e IA.

En otras palabras: el objetivo de negocio es **validar y escalar un modelo de venta B2B/B2C vía WhatsApp asistido por una landing inteligente**, y el objetivo técnico es **construir la base de datos de productos y la arquitectura de forma tan disciplinada que agregar el Panel Administrativo, el CRM o pagos en línea en 2-3 años sea una extensión, no una reconstrucción**.

La "regla de oro" que gobierna cualquier decisión de diseño o desarrollo, repetida en los tres documentos principales, es:

> ¿Esta decisión hace que comprar sea más rápido, más sencillo y genere más confianza?

Si la respuesta es no, se descarta, sin importar qué tan atractiva sea técnica o visualmente.

---

## 2. Arquitectura Recomendada

### 2.1 Stack tecnológico (obligatorio según documentación, sin alternativas)

| Capa | Tecnología | Fuente |
|---|---|---|
| Framework | Next.js 15, App Router | Dev Rules, Dev Bible, PRD §13 |
| UI Library | React 19 | Dev Bible |
| Lenguaje | TypeScript estricto (`strict: true`, prohibido `any`) | Dev Rules, Dev Bible |
| Estilos | Tailwind CSS | Dev Rules, Dev Bible, PRD §13 |
| Componentes UI base | shadcn/ui (Radix + Tailwind) | Dev Rules |
| Iconografía | Lucide Icons | Todos |
| Animaciones | Framer Motion (única librería de animación) | Todos |
| Estado global | Zustand (carrito, negocio seleccionado, búsqueda, UI) | Dev Rules, Dev Bible, PRD §13 |
| Formularios | React Hook Form | Dev Rules, PRD §13 |
| Validación | Zod | Dev Rules, PRD §13 |
| Imágenes | `next/image`, formato WebP | Todos |
| Deploy | Vercel | Dev Bible |
| Base de datos (futura) | Supabase (arquitectura preparada, no implementada en MVP) | Dev Rules, Product DB §1 |

### 2.2 Principios de arquitectura

1. **Separación estricta datos ⇄ interfaz.** Ningún componente contiene texto de marketing, precios ni productos. Todo viene de `content/`, `data/` y `config/`, replicando 1:1 la Base Oficial de Productos y el CMS documentados. Esto es lo que permite, el día de mañana, sustituir esos archivos por llamadas a Supabase sin tocar un solo componente visual.
2. **Arquitectura por features, no por tipo de archivo.** Cada bloque comercial de la Landing (Hero, Centro de Negocios, Catálogo, Centro de Pedido, WhatsApp, FAQ, etc.) es un módulo independiente en `features/`, con sus propios subcomponentes, siguiendo el patrón que exige la Development Bible (`Hero/Hero.tsx`, `HeroImage.tsx`, `HeroContent.tsx`, `index.ts`) y el límite de ~250 líneas por componente.
3. **Una única fuente de verdad por dominio.** Precios y productos → Product Database (`data/products.ts` + `services/product.service.ts`). Copys y microcopys → CMS (`content/*.ts`). Datos institucionales (WhatsApp, redes, horarios, cobertura) → `config/brand.ts`, `config/coverage.ts`. Nunca se duplica el mismo dato en dos archivos.
4. **Repositorio como capa de abstracción.** Los `services/*.service.ts` son la única puerta de entrada a los datos (ej. `getProducts()`, `getProductBySlug()`). Los componentes nunca importan `data/products.ts` directamente. Esto es lo que hace trivial migrar de archivos estáticos a Supabase: se reescribe el servicio, no la UI.
5. **Estado global mínimo.** Zustand administra únicamente lo que el PRD y la Dev Bible autorizan explícitamente: carrito/pedido (persistido en `localStorage`), tipo de negocio seleccionado, término de búsqueda y estado de UI (menú, drawer). Todo lo demás es estado local de componente.
6. **SEO y performance nativos de Next.js 15**, sin librerías externas: Metadata API por página/producto, `app/sitemap.ts` y `app/robots.ts` generados por Next, JSON-LD manual para `Organization`, `LocalBusiness`, `Product` y `FAQPage`.
7. **Analítica desacoplada.** Un módulo `analytics/` centraliza eventos (`product_added`, `checkout_whatsapp`, etc.) y los reenvía a GA4/GTM/Meta Pixel/TikTok Pixel/Clarity vía `next/script`, sin SDKs npm pesados — así el día de mañana se puede apagar o cambiar un proveedor sin tocar los componentes que disparan eventos.
8. **Ruta admin reservada, no construida.** Se deja el route group `(admin)` vacío/placeholder en `app/` para que la Fase 2 (Panel Administrativo) no requiera reestructurar el `app/` existente, tal como pide el PRD §20.14.

### 2.3 Organización del código

Estructura de carpetas por **features + capas técnicas**, fusionando lo pedido por Development Rules, Development Bible y PRD §13 (que son consistentes entre sí en más del 90%):

`app/`, `components/` (ui + layout compartido), `features/` (módulos comerciales), `hooks/`, `store/`, `services/`, `data/`, `content/`, `config/`, `constants/`, `types/`, `lib/`, `analytics/`, `providers/`, `styles/`, `public/`.

### 2.4 Gestión del estado

- **Zustand + middleware `persist`** para el store de pedido (Centro de Pedido), persistido en `localStorage` (PRD §10.12, Dev Bible "Carrito: Persistencia LocalStorage. Sin Backend").
- Store de negocio seleccionado (`business.store.ts`) — no persistido en MVP, aunque el PRD §8.13 ya anticipa recordarlo en el futuro.
- Store de búsqueda y UI, ambos efímeros.
- Nada de Redux, Context API para todo el árbol, ni estado global para datos que un solo componente necesita (regla explícita del PRD §13.6).

### 2.5 Base de datos / capa de datos

- **MVP:** archivos TypeScript tipados en `data/` (`products.ts`, `categories.ts`, `businesses.ts`, `promotions.ts`, `faq.ts`), poblados **exactamente** con la información de la Base Oficial de Productos (SKUs, precios, líneas comerciales) — nunca inventada ni aproximada.
- **Validación en build-time:** esquemas Zod que validan la integridad de `data/products.ts` en tiempo de compilación (producto sin precio, sin imagen, categoría vacía, cantidades negativas) — implementa literalmente el PRD §19.14 como un chequeo automático, no manual.
- **Preparación explícita para Supabase:** los tipos (`types/product.types.ts`, etc.) se modelan igual a como estarían las tablas en Postgres/Supabase, para que la migración futura sea un cambio de implementación del `service`, no del modelo de datos.

### 2.6 Escalabilidad

- Rutas de producto individuales (`/productos/[slug]`) preparadas desde el MVP para SEO futuro, aunque el MVP solo enlace a ellas internamente si se decide activarlas (PRD §16.6 pide dejar la arquitectura lista para páginas por categoría/ciudad/producto).
- Multi-negocio/multi-sucursal: `config/brand.ts` ya modelado por "Configuración Global" vs "Configuración Operativa" tal como exige CMS Cap. 17, para no reescribir configuración cuando exista más de una sede.
- Internacionalización, multi-moneda y multi-idioma: no se implementan, pero el aislamiento de `content/` y `config/` evita que el copy quede acoplado al código cuando se necesiten en el futuro.

---

## 3. Árbol Completo del Proyecto

```
vantro/
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── package.json
├── README.md
│
├── public/
│   ├── favicon.ico
│   ├── manifest-icons/
│   └── fonts/                          (si Poppins se autohospeda en vez de Google Fonts)
│
└── src/
    ├── app/
    │   ├── layout.tsx                  (HTML shell, fuentes, providers globales)
    │   ├── page.tsx                    (Home: compone Hero, BusinessSelector, Catalog, etc.)
    │   ├── globals.css
    │   ├── sitemap.ts
    │   ├── robots.ts
    │   ├── manifest.ts
    │   ├── opengraph-image.tsx
    │   ├── productos/
    │   │   └── [slug]/
    │   │       └── page.tsx            (ficha de producto — preparado, activable a futuro)
    │   ├── (admin)/                    (route group RESERVADO — vacío en el MVP, ver Fase 2)
    │   │   └── .gitkeep
    │   └── api/
    │       └── .gitkeep                (reservado para futuras API routes, ninguna en MVP)
    │
    ├── components/
    │   ├── ui/                         (primitivas shadcn/ui: button, input, sheet, dialog,
    │   │                                 accordion, badge, skeleton, tooltip)
    │   ├── layout/
    │   │   ├── Header/
    │   │   │   ├── Header.tsx
    │   │   │   ├── Logo.tsx
    │   │   │   ├── SearchButton.tsx
    │   │   │   ├── SearchInput.tsx
    │   │   │   ├── CartButton.tsx
    │   │   │   ├── SideMenu.tsx
    │   │   │   └── index.ts
    │   │   └── Footer/
    │   │       ├── Footer.tsx
    │   │       ├── BrandSection.tsx
    │   │       ├── ContactSection.tsx
    │   │       ├── CoverageSection.tsx
    │   │       ├── SocialSection.tsx
    │   │       ├── TrustIndicators.tsx
    │   │       ├── LegalSection.tsx
    │   │       └── index.ts
    │   └── shared/
    │       ├── SectionTitle.tsx
    │       ├── EmptyState.tsx
    │       ├── SkeletonCard.tsx
    │       └── WhatsappFloatingButton.tsx
    │
    ├── features/
    │   ├── hero/
    │   │   ├── Hero.tsx
    │   │   ├── HeroImage.tsx
    │   │   ├── HeroContent.tsx
    │   │   ├── HeroBenefits.tsx
    │   │   ├── HeroCTA.tsx
    │   │   └── index.ts
    │   ├── business-selector/          (Centro de Negocios: "¿Qué necesitas hoy?")
    │   │   ├── BusinessSelector.tsx
    │   │   ├── BusinessCard.tsx
    │   │   └── index.ts
    │   ├── catalog/
    │   │   ├── Catalog.tsx
    │   │   ├── ProductCard.tsx
    │   │   ├── ProductGrid.tsx
    │   │   ├── ProductBadge.tsx
    │   │   ├── ProductQuantitySelector.tsx
    │   │   ├── CrossSell.tsx
    │   │   ├── CatalogEmptyState.tsx
    │   │   └── index.ts
    │   ├── search/
    │   │   ├── SearchBar.tsx
    │   │   ├── SearchResults.tsx
    │   │   └── index.ts
    │   ├── cart/                       (Centro de Pedido)
    │   │   ├── CartButton.tsx
    │   │   ├── CartDrawer.tsx
    │   │   ├── CartItem.tsx
    │   │   ├── CartSummary.tsx
    │   │   ├── CartRecommendations.tsx
    │   │   ├── CartEmptyState.tsx
    │   │   ├── CartObservations.tsx
    │   │   └── index.ts
    │   ├── whatsapp/
    │   │   ├── WhatsappCheckout.tsx
    │   │   ├── OrderSummary.tsx
    │   │   ├── PostPurchaseMessage.tsx
    │   │   ├── order.formatter.ts      (construye el texto del mensaje)
    │   │   ├── whatsapp.builder.ts     (construye la URL wa.me)
    │   │   └── index.ts
    │   ├── why-vantro/                 (¿Por qué VANTRO? — 4 pilares)
    │   ├── our-story/                  (Nuestra Historia, Misión, Visión, Valores)
    │   ├── trust/                      (Confianza y prueba social, testimonios, galería)
    │   ├── faq/
    │   │   ├── Faq.tsx
    │   │   ├── FaqItem.tsx
    │   │   └── index.ts
    │   └── cta-final/                  (Llamado final antes del Footer)
    │
    ├── hooks/
    │   ├── useCart.ts
    │   ├── useProducts.ts
    │   ├── useBusinessType.ts
    │   ├── useSearch.ts
    │   ├── useScrollHeader.ts
    │   └── useMediaQuery.ts
    │
    ├── store/
    │   ├── cart.store.ts               (Zustand + persist → localStorage)
    │   ├── business.store.ts
    │   ├── search.store.ts
    │   └── ui.store.ts
    │
    ├── services/
    │   ├── product.service.ts
    │   ├── category.service.ts
    │   ├── business.service.ts
    │   ├── order.service.ts
    │   └── whatsapp.service.ts
    │
    ├── data/                           (= Base Oficial de Productos, hoy en TS, mañana Supabase)
    │   ├── products.ts
    │   ├── categories.ts
    │   ├── businesses.ts
    │   ├── promotions.ts
    │   ├── faq.ts
    │   └── testimonials.ts
    │
    ├── content/                        (= CMS & Content Bible, textos exactos de la marca)
    │   ├── hero.content.ts
    │   ├── business-selector.content.ts
    │   ├── why-vantro.content.ts
    │   ├── our-story.content.ts
    │   ├── microcopy.content.ts
    │   ├── footer.content.ts
    │   ├── whatsapp.templates.ts
    │   └── seo.content.ts
    │
    ├── config/
    │   ├── brand.ts                    (nombre, WhatsApp, redes, horarios — config global)
    │   ├── coverage.ts                 (ciudades, costos de envío — config operativa)
    │   ├── payment-methods.ts
    │   ├── theme.ts                    (tokens de color/tipografía referenciados por Tailwind)
    │   └── site.ts                     (metadata base, URL canónica)
    │
    ├── constants/
    │   ├── routes.ts
    │   ├── animation.ts                (duraciones/curvas de Framer Motion centralizadas)
    │   └── breakpoints.ts
    │
    ├── types/
    │   ├── product.types.ts
    │   ├── category.types.ts
    │   ├── business.types.ts
    │   ├── cart.types.ts
    │   ├── order.types.ts
    │   ├── customer.types.ts           (preparado, sin uso en MVP)
    │   └── config.types.ts
    │
    ├── lib/
    │   ├── utils.ts                    (cn() helper de clases, convención shadcn/ui)
    │   ├── currency.ts
    │   ├── slug.ts
    │   ├── formatDate.ts
    │   └── validators.ts               (esquemas Zod: producto, pedido, observaciones)
    │
    ├── analytics/
    │   ├── events.ts                   (catálogo de eventos: product_added, checkout_whatsapp…)
    │   ├── track.ts
    │   ├── providers.ts                (GA4, GTM, Meta Pixel, TikTok Pixel, Clarity)
    │   └── pixels.ts
    │
    ├── providers/
    │   ├── AppProviders.tsx
    │   └── AnalyticsProvider.tsx
    │
    └── styles/
        └── globals.css
```

---

## 4. Plan de Desarrollo (por Sprints)

Recomiendo trabajar por **sprints revisables**, no por secciones aisladas, tal como concluiste en tu mensaje. Cada sprint entrega algo demostrable y se aprueba antes de continuar:

| Sprint | Contenido | Entregable verificable |
|---|---|---|
| **0** | Este documento de arquitectura | Tu aprobación por escrito |
| **1** | Configuración base: Next.js 15 + TS estricto + Tailwind + ESLint/Prettier + shadcn/ui init + fuentes (Poppins) + estructura de carpetas vacía + variables de entorno | `npm run dev` sirve una página en blanco con la tipografía y colores base correctos |
| **2** | Sistema de Diseño: `Button`, `Input`, `Badge`, `Card`, `SectionTitle`, tokens de color/espaciado/sombra, `constants/animation.ts` | Página de inventario visual (`/design-system`, solo dev) mostrando todos los componentes base |
| **3** | Layout y Navegación: `Header` (estados scroll/transparente), `SideMenu`, `Footer` completo, `SearchBar` (UI, sin datos aún) | Header/Footer navegables y responsive en 390/768/1440px |
| **4** | Capa de datos: `types/`, `data/products.ts` con **todos** los SKUs reales del Product Database, `services/`, validación Zod de la data | Consola confirma que la data pasa validación; ningún producto inventado |
| **5** | Home: `Hero`, `BusinessSelector` (Centro de Negocios) conectado al store de negocio | Cambiar de tarjeta de negocio filtra visualmente (mock) sin recargar |
| **6** | Catálogo Inteligente: `ProductCard`, `ProductGrid`, filtrado por negocio, `SearchBar` funcional, `CrossSell` | Catálogo real filtrado por tipo de negocio, búsqueda en tiempo real |
| **7** | Centro de Pedido + WhatsApp: `cart.store` con persist, `CartDrawer`, `CartItem`, `order.formatter`, `whatsapp.builder` | Flujo completo: agregar producto → abrir Centro de Pedido → botón abre WhatsApp con mensaje correcto |
| **8** | Secciones comerciales restantes: ¿Por qué VANTRO?, Nuestra Historia, Confianza/Testimonios, FAQ, CTA final | Landing completa de arriba a abajo según el orden del PRD §2.5 |
| **9** | SEO + Analítica: metadata por página, `sitemap.ts`/`robots.ts`, JSON-LD, integración GA4/GTM/Meta Pixel/TikTok Pixel/Clarity | Lighthouse SEO ≥95, eventos visibles en GA4 DebugView |
| **10** | Performance, Accesibilidad y QA: auditoría Lighthouse, `prefers-reduced-motion`, navegación por teclado, checklist de lanzamiento (CMS Cap. 19) | Lighthouse Performance/Accesibilidad/SEO ≥95, checklist firmado |
| **11+** *(fuera del MVP)* | Panel Administrativo (V2), Inventario (V3), CRM/Automatizaciones (V3), Pagos en línea, IA | Se planifican como proyectos independientes sobre esta misma base |

---

## 5. Dependencias (justificadas una por una)

| Paquete | Por qué se incluye |
|---|---|
| `next` (15) | Framework obligatorio por los 4 documentos técnicos. |
| `react`, `react-dom` (19) | Requerido por Next.js 15. |
| `typescript` | Tipado estricto obligatorio; prohibido `any` en toda la documentación. |
| `tailwindcss`, `postcss`, `autoprefixer` | Sistema de estilos oficial; prohibido Bootstrap/CSS-in-JS/CSS inline. |
| `clsx`, `tailwind-merge` | Helper `cn()` estándar de shadcn/ui para componer clases condicionales sin strings manuales. |
| `shadcn/ui` (CLI, no es dependencia de runtime tradicional — copia componentes a `components/ui`) | Exigido explícitamente por Development Rules; usa Radix UI internamente para accesibilidad (focus trap, aria) que de otro modo tendríamos que reimplementar a mano para cumplir el estándar de accesibilidad pedido en PRD §13.12. |
| `lucide-react` | Única librería de iconos autorizada por los 4 documentos. |
| `framer-motion` | Única librería de animación autorizada; PRD §12.19 prohíbe explícitamente mezclar con animaciones CSS custom. |
| `zustand` | Estado global mínimo pedido por Dev Rules y Dev Bible; su tamaño (~1kb) evita el sobrecosto de Redux, explícitamente prohibido sin justificación. |
| `react-hook-form` | Pedido por Dev Rules/PRD para el campo de observaciones y futuros formularios; evita re-renders innecesarios (relevante para el objetivo de 60fps). |
| `zod` + `@hookform/resolvers` | Validación de formularios y validación de la Base de Productos en build-time (ver Mejora #6). |
| *(nativo de Next 15, sin librería)* Metadata API, `sitemap.ts`, `robots.ts` | Next.js 15 ya genera sitemap/robots/metadata sin dependencias externas — evita instalar `next-sitemap` u otros paquetes que la documentación pide evitar si no son "realmente necesarios" (PRD §24.8). |
| `eslint`, `eslint-config-next`, `prettier`, `prettier-plugin-tailwindcss` | Calidad de código y consistencia de clases Tailwind, exigidas por Dev Rules. |
| `vitest`, `@testing-library/react` *(recomendado para Sprint 10, no día 1)* | Pruebas unitarias de `lib/`, `services/` y hooks (formateador de WhatsApp, cálculo de totales) — utilidades críticas de negocio que deben probarse antes del lanzamiento. |

**Explícitamente NO se instalan** (prohibido por Dev Rules / Dev Bible): Bootstrap, jQuery, Redux, librerías de carrusel automático, CSS-in-JS, SDKs npm pesados de analítica (se usa `next/script` con los snippets oficiales en su lugar), ni ningún paquete de UI adicional que duplique lo que ya cubre shadcn/ui.

---

## 6. Riesgos Identificados y Mitigación

1. **Activos reales faltantes (fotos, logo, video).** La documentación asume material profesional que hoy no está adjunto. → Mitigación: construir con placeholders elegantes definidos en CMS Cap. 18 (`imagePending: boolean` por producto) y bloquear el checklist de lanzamiento (CMS Cap. 19) hasta reemplazarlos.
2. **Precios pendientes en varias líneas** (Tocino, Hamburguesas 125/200/300g, toda la Línea Fitness, casi toda la Línea Hogar, todos los Complementos). → Mitigación: el estado "Consulta disponibilidad" se implementa como estado de primera clase del `ProductCard` desde el Sprint 4, no como parche posterior.
3. **Documento "Brand Book" / "Asset Management Bible" referenciado pero no incluido.** README y varios capítulos citan estos documentos como fuente de prioridad, pero solo llegaron 6 archivos y el más cercano es CMS Cap. 18. → Mitigación: usar CMS Cap. 18 como fuente hasta recibir el documento real; ver Pregunta 1.
4. **Vacíos en el propio Product Database:** el Capítulo 18 no existe en el archivo entregado (se salta del 17 al 19) y el Capítulo 17 (SEO de producto) queda cortado a mitad de una lista de keywords. → Mitigación: no inventar ese contenido; ver Pregunta 7.
5. **Hidratación de Zustand + `persist` en Next.js App Router.** Leer `localStorage` en el primer render del servidor puede causar mismatch de hidratación. → Mitigación: patrón estándar de "skip hydration" / render condicional en cliente para el store de carrito.
6. **Límites de longitud en enlaces `wa.me`.** Pedidos largos con muchas observaciones pueden generar URLs que algunos navegadores/SO truncan. → Mitigación: probar con pedidos de 15+ productos durante QA (Sprint 10) y definir un límite razonable de caracteres en observaciones (regla ya sugerida en Zod).
7. **Comportamiento distinto de WhatsApp en desktop vs. móvil** (WhatsApp Web vs. app nativa) al abrir el enlace generado. → Mitigación: probar ambos flujos explícitamente en el checklist de QA.
8. **Riesgo de sobre-construcción (scope creep).** La documentación menciona CRM, ERP, IA, multi-sucursal constantemente; existe tentación de empezar a modelarlos ya. → Mitigación: aplicar YAGNI estrictamente en el MVP; la arquitectura ya deja "ganchos" (tipos, route group `(admin)`, separación de capas) sin construir la funcionalidad.
9. **Performance con Framer Motion + imágenes de producto en un catálogo que puede crecer a cientos de SKUs.** → Mitigación: `next/image` con `priority` solo en el Hero, lazy loading en el resto, memoización de `ProductCard`, y auditoría de Lighthouse específica en Sprint 10 con un catálogo de prueba ampliado.

---

## 7. Mejoras Propuestas (visión de CTO)

1. **Validar la Base de Productos en build-time con Zod**, no solo confiar en la disciplina manual: si un producto no tiene imagen, precio o categoría, el build debe fallar. Esto convierte una regla de "no debes" (PRD §19.14) en un chequeo automático imposible de saltarse.
2. **Tratar el estado "Consulta disponibilidad / precio pendiente" como un estado de UI de primera clase desde el Sprint 4**, con su propio componente visual, en vez de parchearlo cuando aparezca el primer producto sin precio.
3. **Agregar Vercel Analytics + Speed Insights** (gratuitos, cero configuración, cero JS adicional relevante) junto a GA4/GTM, dado que Vercel ya es el hosting oficial — visión de performance en producción sin coste de mantenimiento.
4. **Página interna de Design System (`/design-system`, solo en desarrollo)** para revisar visualmente Button/Input/Badge/Card antes de integrarlos a las secciones reales — barato de construir con 5-6 componentes base y evita inconsistencias tempranas.
5. **Definir `siteConfig` (WhatsApp, redes, horarios) como el primer archivo que se llena con datos reales**, no como una tarea de "Sprint 9 SEO" — hoy varios documentos usan placeholders (`(+57) XXX XXX XXXX`) y ese dato bloquea probar el flujo de WhatsApp de punta a punta desde el Sprint 7.
6. **Reutilizar los mismos esquemas Zod para tres propósitos**: inferencia de tipos TypeScript, validación de formularios (observaciones) y validación de la Base de Productos en build — un único esquema, tres usos, cero duplicación.
7. **Registrar manualmente un log de decisiones/cambios de contenido** (`CHANGELOG.md` simple) desde el día 1, ya que el CMS Cap. 16 pide "versionado" del contenido aunque sea de forma conceptual en el MVP — cuesta minutos hoy y evita perder trazabilidad después.

---

## 8. Preguntas Pendientes (bloquean módulos específicos)

1. **Brand Book / Assets Bible independiente.** El README y varios capítulos citan estos documentos con prioridad sobre la Development Bible, pero no fueron entregados como archivos separados; lo más cercano es CMS Cap. 18. ¿Existen archivos reales de logo (SVG/PNG, versiones color/blanco/negro) y una guía de marca adicional, o debo tomar el CMS Cap. 18 como fuente única?
2. **Fotografías y video reales.** ¿Hay banco de fotos profesional ya producido (Hero, productos, proceso, equipo), o se lanza con los placeholders elegantes descritos en CMS §18.11 y se reemplazan después?
3. ~~**Número oficial de WhatsApp comercial**~~ — **Resuelto:** +57 304 398 9146, ya configurado en `config/brand.ts` y en uso en el botón flotante, el Centro de Pedido y el Footer.
4. **Precios pendientes**: Tocino (CR-004), Hamburguesa Angus 125g/200g/300g, toda la Línea Fitness, casi toda la Línea Hogar y todos los Complementos no tienen precio definido en el Product Database. ¿Se lanza el MVP mostrando "Consulta disponibilidad" para ellos, o se definen precios antes del lanzamiento?
5. **Dominio y hosting**: ¿ya existe un dominio registrado (p. ej. vantro.co) y una cuenta de Vercel, o debo asumir un entorno de desarrollo sin dominio hasta el lanzamiento?
6. **IDs reales de integraciones**: Meta Pixel ID, GA4 Measurement ID, GTM Container ID, TikTok Pixel ID, Microsoft Clarity ID — necesarios para el Sprint 9 (Analítica).
7. **Capítulo 18 del Product Database no existe en el archivo entregado** (la numeración salta del 17 al 19) y el **Capítulo 17 (SEO de producto) queda cortado** a mitad de una lista de palabras clave. ¿Falta contenido por entregar en ese documento?
8. **Información bancaria real** (Nequi, Daviplata, cuentas) que el asesor comercial usará para confirmar pagos por WhatsApp — no se muestra en la Landing, pero el flujo de negocio documentado la referencia.
9. **Tarifas de envío por ciudad** (Barranquilla, Soledad, Puerto Colombia, Malambo, Galapa): ¿existen costos y tiempos definidos, o en esta v1 siempre se confirman por WhatsApp?
10. **Conflicto de prioridad entre documentos.** El orden de prioridad declarado repetidamente es *PRD Maestro > CMS > Product Database > Brand Book > Development Bible*, pero el documento "01 DEVELOPMENT" (Development Rules) — que exige shadcn/ui y un límite de 250 líneas por componente, no mencionados en la Development Bible — no aparece en esa lista. ¿Cómo se ubica ese documento en el orden de prioridad? Mi supuesto de trabajo es que lo complementa sin contradecirlo; lo he seguido en esta propuesta, pero pido tu confirmación explícita.

---

**No se ha escrito ningún componente, ninguna sección de la Landing ni configuración funcional.** Quedo a la espera de tu revisión de este documento y de las respuestas a la Sección 8. El desarrollo solo comenzará cuando escribas:

**APROBADO, COMIENZA EL DESARROLLO**
