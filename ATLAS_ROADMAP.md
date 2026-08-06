# ATLAS ROADMAP

## 1. Lectura ejecutiva

Atlas ya tiene una identidad clara: un diario personal de lugares, memoria, vino y lectura, con una capa social discreta y una promesa emocional fuerte: **"Places disappear. Stories remain."** La base actual combina Next.js App Router, Supabase, React Leaflet, almacenamiento de fotos, PDFs, autenticación por email/Google y un asistente de IA llamado CanIA.

El salto a una aplicación premium no depende de pequeñas correcciones aisladas. Depende de convertir la base existente en una plataforma coherente, segura, escalable y emocionalmente diferenciada: un producto donde cada memoria, botella, mapa, perfil y recomendación de IA esté conectado por un modelo de datos sólido y una experiencia de usuario de alto nivel.

## 2. Arquitectura actual comprendida

### 2.1 Stack

- **Frontend:** Next.js 13 con App Router, React 18 y TypeScript.
- **Estilos:** Tailwind CSS con tokens propios para fondo, foreground, olive, burgundy, border y sombras suaves.
- **Backend-as-a-Service:** Supabase para autenticación, base de datos y storage.
- **Mapa:** React Leaflet + Leaflet, cargado dinámicamente en cliente para evitar SSR.
- **IA:** Google Gemini vía `@google/genai`, expuesto desde una route handler de Next.js.
- **Contenido local:** datos mock en `lib/data.ts` para memorias, vinos, libros, artículos y usuarios.
- **Navegación:** shell móvil con bottom navigation.

### 2.2 Modelo funcional actual

Atlas está dividido en ocho áreas principales:

1. **Landing / autenticación:** formulario en `/` con email/password, registro y OAuth Google; existe además `/login` como flujo alternativo.
2. **Home / mapa:** `/home` muestra un mapa interactivo, geolocalización del usuario y memorias cargadas desde Supabase.
3. **Memorias:** `/memories` y `/memories/[id]` aún dependen de datos estáticos de `lib/data.ts`; `/memories/new` es un formulario visual sin persistencia real.
4. **Vinos:** `/wines` consulta e inserta vinos en Supabase, permite subir fotos a Supabase Storage y filtrar por supermercado.
5. **CanIA:** asistente flotante en vinos que envía prompts a una API interna basada en Gemini.
6. **Perfiles:** `/profile` carga usuario autenticado, estadísticas por `user_id`, datos de `profiles` y permite upsert del perfil.
7. **Artículos:** `/articles` renderiza contenido local estático.
8. **Libros:** `/books` renderiza una sala de lectura con enlaces a una carpeta de Google Drive.

## 3. Supabase: comprensión y diagnóstico

### 3.1 Uso actual

Atlas utiliza un cliente Supabase browser-side creado con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Actualmente se consultan o actualizan las tablas:

- `memories`
- `wines`
- `profiles`

También se usa Supabase Auth para:

- `signInWithPassword`
- `signUp`
- `signInWithOAuth` con Google
- `auth.getUser()` en mapa y perfil

Y Supabase Storage para:

- bucket `wine-photos`
- subida de imágenes de vino
- lectura pública con `getPublicUrl`

### 3.2 Problemas estructurales detectados

- No existe una capa de repositorios o servicios: los componentes consultan Supabase directamente.
- No hay tipos generados desde Supabase, por lo que se usa `any[]` y modelos incompletos.
- Hay mezcla de datos estáticos y datos reales, lo que fragmenta la experiencia.
- No se ve un middleware de sesión ni protección global de rutas privadas.
- La visibilidad de memorias depende de RLS fuera del código visible, pero la UI no demuestra una política consistente de privacidad, amistad o compartición.
- No hay manejo estandarizado de errores, estados vacíos, reintentos ni telemetría.
- No hay migraciones/versionado de esquema dentro del repositorio.

### 3.3 Dirección premium recomendada

Supabase debe pasar de ser una dependencia usada desde componentes a ser una capa de plataforma:

- esquema versionado;
- tipos generados;
- políticas RLS auditables;
- funciones RPC para operaciones sensibles;
- storage privado con signed URLs cuando aplique;
- edge functions o route handlers para procesos con secretos;
- un modelo social robusto: contactos, círculos, permisos y colaboraciones.

## 4. Autenticación: comprensión y diagnóstico

### 4.1 Estado actual

Hay dos entradas de autenticación: `/` y `/login`. La ruta raíz tiene un diseño más alineado con el producto y redirige a `/home` tras login; `/login` muestra un formulario independiente y al iniciar sesión solo actualiza un mensaje, sin redirección clara.

### 4.2 Debilidades

- Flujos duplicados y divergentes.
- No hay middleware para bloquear `/home`, `/profile`, `/wines` o creación de memorias a usuarios no autenticados.
- No existe onboarding posterior al registro.
- No hay recuperación de contraseña, magic link, verificación de perfil o cierre de sesión visible.
- La app depende de `auth.getUser()` en cliente sin una estrategia consistente de sesión SSR/client.

### 4.3 Dirección premium

- Unificar autenticación en un único flujo.
- Añadir middleware de sesión.
- Crear onboarding para nombre, avatar, país, preferencias de privacidad y gustos de vino.
- Añadir settings, logout, password reset, OAuth linking y eliminación de cuenta.
- Convertir el perfil en la fuente principal de identidad dentro de Atlas.

## 5. Mapa: comprensión y diagnóstico

### 5.1 Estado actual

El mapa se carga dinámicamente en `/home`, usa React Leaflet, solicita geolocalización, centra el mapa en el usuario y muestra marcadores desde `memories`. Permite crear una memoria con título, descripción, visibilidad y lista de amigos, aunque actualmente se pasa `availableFriends={[]}`.

### 5.2 Debilidades

- No hay búsqueda real pese a existir input visual.
- No hay clustering, filtros, capas ni timeline.
- La creación de memorias usa la ubicación actual o Madrid por defecto; no permite elegir ubicación exacta.
- No hay geocodificación, reverse geocoding ni edición de coordenadas.
- La privacidad `public/private/shared` está en la UI, pero sin flujo real de amigos.
- El icono de Leaflet está configurado de forma frágil.
- No hay estado offline, carga incremental ni paginación espacial.

### 5.3 Dirección premium

El mapa debe ser el corazón de Atlas:

- mapa emocional, no solo geográfico;
- capas por año, personas, vinos, viajes, privacidad y momentos;
- clustering y exploración por región;
- creación de memoria seleccionando punto o importando foto con GPS;
- timeline sincronizado con mapa;
- rutas de viaje;
- modo privado, compartido y familiar.

## 6. Sección de vinos: comprensión y diagnóstico

### 6.1 Estado actual

La sección `/wines` carga vinos desde Supabase, permite añadir un vino, subir foto, asignar supermercado, precio, puntuación y notas de cata. Incluye filtros por tiendas y muestra CanIA como asistente flotante.

### 6.2 Debilidades

- El modelo de vino es demasiado básico para una experiencia premium.
- Falta relación entre vinos, usuarios, memorias, tiendas, añadas, catas y valoraciones comunitarias.
- Las fotos parecen públicas por defecto.
- No hay validación fuerte, edición, eliminación ni ownership claro en la UI.
- Falta búsqueda por denominación, uva, país, región, precio, maridaje o ocasión.
- Se mezclan ideas de catálogo público y bodega personal sin separación conceptual.
- El formulario tiene una intención de producto potente, pero no hay experiencia de detalle de vino.

### 6.3 Dirección premium

Convertir vinos en tres dominios conectados:

1. **Bodega personal:** lo que tengo, probé o quiero comprar.
2. **Catálogo comunitario:** vinos agregados y normalizados por la comunidad.
3. **Memoria sensorial:** catas vinculadas a lugares, personas, comidas y recuerdos.

## 7. CanIA: comprensión y diagnóstico

### 7.1 Estado actual

CanIA vive como widget flotante en `/wines`. El cliente envía `{ prompt, userWines }` a `/api/cania`, pero la API solo lee `prompt` y devuelve `{ text }`. El cliente espera `data.reply`, por lo que existe una discrepancia contractual entre frontend y backend. La API usa Gemini con `GEMINI_API_KEY` y no añade contexto de vinos ni sistema de instrucciones.

### 7.2 Debilidades

- Contrato de respuesta inconsistente.
- No hay prompt de sistema para personalidad, límites, tono o seguridad.
- No se usa el contexto de vinos enviado por el cliente.
- No hay historial conversacional persistente.
- No hay RAG ni acceso estructurado a datos del usuario.
- No hay protección de cuota, rate limit, logging ni moderación.
- Existe una página `/ai-test` que consulta `/api/ai`, pero esa route no aparece en el árbol visible.

### 7.3 Dirección premium

CanIA debe evolucionar a un sommelier y concierge de memoria:

- recomendaciones basadas en bodega personal;
- maridajes por comida, ocasión, presupuesto y supermercado;
- conexión con memorias: "qué vino tomamos en Lisboa";
- extracción automática de notas de cata desde texto o foto;
- explicación con confianza y fuentes internas;
- acciones: guardar vino, crear lista de compra, vincular a memoria.

## 8. Perfiles: comprensión y diagnóstico

### 8.1 Estado actual

El perfil carga el usuario autenticado, recuenta memorias y vinos por `user_id`, carga `profiles` y permite guardar `full_name`, `username` y `bio`.

### 8.2 Debilidades

- No hay avatar editable ni subida de imagen.
- No hay privacidad de perfil.
- No hay amigos/contactos reales.
- No hay página pública de perfil ni estados de conexión.
- No existe panel de actividad, viajes, bodegas, favoritos o recuerdos compartidos.
- Las estadísticas son básicas y dependen de tablas cuyo esquema no está tipado en el repositorio.

### 8.3 Dirección premium

El perfil debe convertirse en una identidad Atlas:

- avatar, nombre, username único, bio, ubicación opcional;
- preferencias de privacidad;
- círculos de confianza;
- estadísticas narrativas;
- pasaporte de lugares;
- biblioteca personal de vinos;
- exportación de recuerdos.

## 9. Fortalezas

- Concepto de producto diferenciado: memoria + lugares + vinos + lectura + IA.
- Identidad emocional clara y frase de marca fuerte.
- Buen punto de partida visual, especialmente en mobile-first.
- Uso de Supabase para acelerar auth, datos y storage.
- Mapa ya integrado con geolocalización.
- Sección de vinos con inserción real y subida de fotos.
- Perfil conectado al usuario autenticado.
- CanIA introduce una dirección premium clara.
- App Router permite evolucionar hacia server components, route handlers y layouts protegidos.

## 10. Debilidades

- Arquitectura mezclada: componentes UI hacen queries, mutaciones, validaciones y estado.
- Doble fuente de verdad: datos mock y Supabase.
- Autenticación inconsistente y rutas privadas sin guard global visible.
- Modelos sin tipado Supabase ni contratos compartidos.
- Falta de pruebas automatizadas.
- Experiencias incompletas: creación de memoria real en mapa sí, pero `/memories/new` no persiste.
- Libros y artículos son estáticos y no están integrados con perfiles, favoritos o lectura.
- CanIA aún es prototipo y no está conectada a datos reales.
- Diseño inconsistente entre secciones premium y secciones heredadas.
- No hay observabilidad, analítica, auditoría ni control de errores.

## 11. Deuda técnica

### Alta prioridad

- Corregir build y lint antes de escalar producto.
- Eliminar duplicidad de autenticación.
- Definir esquema Supabase en migraciones.
- Generar tipos de Supabase.
- Separar capa de datos de componentes.
- Crear guards de autenticación y autorización.
- Unificar respuesta de APIs de IA.

### Media prioridad

- Normalizar diseño y layout.
- Sustituir `any` por tipos estrictos.
- Crear formularios con validación declarativa.
- Estandarizar loading/error/empty states.
- Mejorar accesibilidad.
- Crear tests de componentes críticos y flujos principales.

### Baja prioridad

- Refactorizar copies y traducciones.
- Normalizar naming entre inglés y español.
- Optimizar imágenes y assets.
- Crear documentación de contribución y entorno local.

## 12. Oportunidades

- Posicionar Atlas como diario privado premium frente a redes sociales ruidosas.
- Diferenciarse con IA emocional y contextual, no IA genérica.
- Crear una experiencia de mapa memorable: viajes, recuerdos, rutas, personas y vinos.
- Monetización premium: bóveda privada, exportaciones, libros de recuerdos, IA avanzada, bodega inteligente.
- Comunidad curada de vinos de supermercado, con recomendaciones reales y accesibles.
- Colaboración íntima: parejas, familias, grupos de viaje.
- Generación de libros/PDFs de viajes o vinos a partir de memorias.

## 13. Funcionalidades que faltan

- Middleware de autenticación y protección de rutas.
- Onboarding de usuario.
- Perfil público/privado completo.
- Amigos, contactos y círculos.
- CRUD completo de memorias.
- Subida de fotos de memorias.
- Selección precisa de ubicación en mapa.
- Búsqueda y filtros del mapa.
- Detalle de vino.
- Edición y eliminación de vinos.
- Bodega personal separada de catálogo público.
- Valoraciones multiusuario y notas de cata estructuradas.
- CanIA con contexto real, historial y acciones.
- Preferencias de privacidad.
- Notificaciones.
- Tests unitarios, integración y e2e.
- Migraciones Supabase y seed reproducible.
- Observabilidad y analítica de producto.
- Internacionalización.
- Modo offline o PWA.

## 14. Propuesta de arquitectura premium

### 14.1 Capas

1. **Presentation:** páginas, layouts, componentes visuales y design system.
2. **Feature modules:** `features/auth`, `features/memories`, `features/map`, `features/wines`, `features/cania`, `features/profile`, `features/library`.
3. **Domain:** tipos de negocio, validaciones, permisos y reglas.
4. **Data access:** clientes Supabase tipados, repositorios y queries.
5. **Server/API:** route handlers, server actions o edge functions para procesos seguros.
6. **Infrastructure:** storage, IA, geocoding, analytics, logs y jobs.

### 14.2 Modelo de datos recomendado

- `profiles`
- `memories`
- `memory_photos`
- `memory_participants`
- `memory_visibility_grants`
- `friendships` / `connections`
- `circles`
- `circle_members`
- `wines`
- `wine_photos`
- `wine_tastings`
- `wine_ratings`
- `wine_locations`
- `memory_wines`
- `articles`
- `books`
- `reading_progress`
- `ai_conversations`
- `ai_messages`
- `audit_events`

### 14.3 Seguridad

- RLS obligatoria en tablas de usuario.
- Storage privado para memorias y fotos personales.
- Signed URLs para recursos privados.
- Server-only secrets para IA.
- Rate limit para CanIA.
- Auditoría de cambios sensibles.

### 14.4 UX premium

- Mobile-first, pero no mobile-only.
- Diseño de alta densidad emocional: fotos, mapa, fechas, personas, botellas y relatos.
- Microinteracciones sobrias.
- Accesibilidad AA.
- Estados vacíos inspiradores y útiles.
- Navegación consistente.

## 15. Roadmap por versiones

## Atlas 2.1 — Fundaciones premium

**Objetivo:** estabilizar la app y preparar la base para crecer sin deuda crítica.

| Área | Funcionalidades | Dificultad | Impacto | Tiempo estimado |
|---|---|---:|---:|---:|
| Arquitectura | Definir módulos por dominio y capa de datos | Media | Alto | 4-6 días |
| Supabase | Añadir migraciones, tipos generados y esquema documentado | Media | Alto | 4-5 días |
| Auth | Unificar login/registro y crear protección de rutas | Media | Alto | 3-5 días |
| Calidad | Corregir build, lint crítico y añadir suite mínima de tests | Media | Alto | 4-6 días |
| UX | Normalizar layout, navegación y estados loading/error/empty | Media | Medio | 3-5 días |

**Resultado esperado:** Atlas compila, tiene flujos autenticados consistentes y una base técnica lista para producto premium.

## Atlas 2.2 — Memorias reales y mapa premium básico

**Objetivo:** convertir el mapa y las memorias en el núcleo real de la aplicación.

| Área | Funcionalidades | Dificultad | Impacto | Tiempo estimado |
|---|---|---:|---:|---:|
| Memorias | CRUD completo con Supabase | Media | Alto | 5-7 días |
| Fotos | Subida de imágenes de memorias a Storage | Media | Alto | 4-6 días |
| Mapa | Crear memoria eligiendo punto en el mapa | Media | Alto | 4-6 días |
| Privacidad | Visibilidad privada/pública/compartida con RLS | Alta | Alto | 6-9 días |
| Búsqueda | Búsqueda básica por título, ciudad y descripción | Baja | Medio | 2-3 días |

**Resultado esperado:** los usuarios pueden guardar recuerdos reales, con fotos, ubicación exacta y privacidad funcional.

## Atlas 2.3 — Identidad, perfiles y círculos

**Objetivo:** transformar usuarios sueltos en una red privada de confianza.

| Área | Funcionalidades | Dificultad | Impacto | Tiempo estimado |
|---|---|---:|---:|---:|
| Perfil | Avatar, username único, bio, preferencias | Media | Alto | 4-6 días |
| Contactos | Solicitudes de amistad/contacto | Alta | Alto | 6-8 días |
| Círculos | Grupos privados para familia, pareja o viajes | Alta | Alto | 6-9 días |
| Compartición | Compartir memoria con contactos/círculos | Alta | Alto | 5-8 días |
| Actividad | Timeline de actividad privada | Media | Medio | 4-6 días |

**Resultado esperado:** Atlas deja de ser un diario individual y se convierte en una red íntima y segura.

## Atlas 2.4 — Bodega personal y catálogo de vinos

**Objetivo:** separar la bodega personal del catálogo comunitario y crear valor real en vinos.

| Área | Funcionalidades | Dificultad | Impacto | Tiempo estimado |
|---|---|---:|---:|---:|
| Vinos | Detalle de vino con ficha completa | Media | Alto | 4-6 días |
| Bodega | Colección personal: tengo/probé/quiero comprar | Media | Alto | 5-7 días |
| Catas | Notas estructuradas, rating, ocasión y maridaje | Media | Alto | 4-6 días |
| Catálogo | Normalización de vino vs entrada de usuario | Alta | Alto | 7-10 días |
| Filtros | Buscar por tienda, precio, rating, región, uva | Media | Medio | 3-5 días |

**Resultado esperado:** Atlas ofrece una experiencia de vino suficientemente rica para justificar uso recurrente.

## Atlas 2.5 — CanIA contextual

**Objetivo:** convertir CanIA de chatbot genérico a asistente personal accionable.

| Área | Funcionalidades | Dificultad | Impacto | Tiempo estimado |
|---|---|---:|---:|---:|
| IA | Prompt de sistema, personalidad y contrato estable | Baja | Alto | 2-3 días |
| Contexto | Inyectar bodega, gustos y memorias relevantes | Alta | Alto | 6-9 días |
| Historial | Conversaciones persistentes por usuario | Media | Medio | 4-6 días |
| Acciones | Guardar recomendación, crear vino o vincular memoria | Alta | Alto | 7-10 días |
| Seguridad | Rate limit, cuotas, logs y manejo de errores | Media | Alto | 4-6 días |

**Resultado esperado:** CanIA recomienda vinos y recuerdos con contexto real, no respuestas genéricas.

## Atlas 2.6 — Mapa avanzado y viajes

**Objetivo:** elevar el mapa a una experiencia premium distintiva.

| Área | Funcionalidades | Dificultad | Impacto | Tiempo estimado |
|---|---|---:|---:|---:|
| Mapa | Clustering y filtros por año/persona/privacidad | Media | Alto | 5-7 días |
| Timeline | Línea temporal sincronizada con mapa | Alta | Alto | 7-10 días |
| Viajes | Agrupar memorias en viajes/rutas | Alta | Alto | 8-12 días |
| Geocoding | Buscar lugares y reverse geocoding | Media | Alto | 4-6 días |
| Importación | Extraer ubicación/fecha desde metadatos de fotos | Alta | Medio | 8-12 días |

**Resultado esperado:** Atlas se siente como un atlas personal vivo, no como una lista con marcadores.

## Atlas 2.7 — Biblioteca, artículos y recuerdos exportables

**Objetivo:** convertir lectura y memoria en un ecosistema editorial premium.

| Área | Funcionalidades | Dificultad | Impacto | Tiempo estimado |
|---|---|---:|---:|---:|
| Biblioteca | Libros desde Supabase en lugar de constantes | Baja | Medio | 2-4 días |
| Lectura | Favoritos, progreso y guardado | Media | Medio | 4-6 días |
| Artículos | CMS ligero para artículos | Media | Medio | 4-6 días |
| Exportación | Crear PDF/libro de viaje o año | Alta | Alto | 8-12 días |
| Plantillas | Diseños premium para memoria exportada | Media | Alto | 5-7 días |

**Resultado esperado:** Atlas puede generar recuerdos tangibles y aumentar su percepción premium.

## Atlas 2.8 — Producto premium y monetización

**Objetivo:** preparar Atlas para usuarios de pago.

| Área | Funcionalidades | Dificultad | Impacto | Tiempo estimado |
|---|---|---:|---:|---:|
| Planes | Free/Premium/Family | Media | Alto | 4-6 días |
| Billing | Stripe o proveedor equivalente | Alta | Alto | 7-10 días |
| Límites | Cuotas de fotos, IA, exportaciones y storage | Media | Alto | 4-6 días |
| Premium | Bóveda privada, CanIA avanzada, exportaciones | Alta | Alto | 8-12 días |
| Admin | Panel mínimo de soporte y métricas | Media | Medio | 5-7 días |

**Resultado esperado:** Atlas tiene una propuesta comercial clara, medible y escalable.

## Atlas 2.9 — Escala, observabilidad y PWA

**Objetivo:** mejorar confiabilidad, rendimiento y experiencia de uso diario.

| Área | Funcionalidades | Dificultad | Impacto | Tiempo estimado |
|---|---|---:|---:|---:|
| Observabilidad | Logs, métricas, errores y trazas | Media | Alto | 4-6 días |
| Performance | Optimización imágenes, queries y bundles | Media | Alto | 5-7 días |
| PWA | Instalación, cache y modo offline parcial | Alta | Medio | 7-10 días |
| E2E | Playwright para flujos críticos | Media | Alto | 4-6 días |
| Internacionalización | ES/EN estructurado | Media | Medio | 4-6 días |

**Resultado esperado:** Atlas se comporta como una aplicación confiable y lista para crecimiento.

## Atlas 3.0 — Atlas como plataforma emocional

**Objetivo:** consolidar Atlas como producto premium completo.

| Área | Funcionalidades | Dificultad | Impacto | Tiempo estimado |
|---|---|---:|---:|---:|
| IA avanzada | RAG, memoria larga, acciones multi-step | Muy alta | Muy alto | 12-18 días |
| Comunidad curada | Rankings privados, recomendaciones locales | Alta | Alto | 8-12 días |
| Colaboración | Memorias coeditadas en tiempo real | Alta | Alto | 10-14 días |
| Importadores | Fotos, Google Timeline, CSV, notas | Muy alta | Alto | 12-18 días |
| Plataforma | API interna y arquitectura multi-tenant preparada | Muy alta | Muy alto | 15-25 días |

**Resultado esperado:** Atlas deja de ser una app de recuerdos y se convierte en una plataforma personal de memoria, lugares y gusto.

## 16. Orden recomendado de ejecución

1. No añadir nuevas features antes de estabilizar Atlas 2.1.
2. Convertir memorias y mapa en producto real antes de expandir libros o IA.
3. Construir identidad/círculos antes de compartir contenido sensible.
4. Separar bodega personal y catálogo antes de hacer CanIA avanzada.
5. Monetizar solo después de que privacidad, exportación e IA tengan valor claro.

## 17. Definición de “premium” para Atlas

Atlas será premium cuando cumpla estas condiciones:

- cada dato personal tiene privacidad clara;
- cada memoria puede entenderse en contexto: lugar, fecha, personas, fotos, vino y relato;
- CanIA conoce el universo privado del usuario y actúa sobre él con permiso;
- el mapa emociona y organiza la vida del usuario;
- la bodega genera decisiones útiles, no solo registros;
- el producto se siente íntimo, seguro, rápido y bello;
- la arquitectura permite crecer sin reescribir todo cada versión.
