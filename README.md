# Torre Villa Grande · Control de Parqueos de Visitas

Aplicación web para que el guarda de seguridad registre entradas y salidas
de vehículos visitantes en los 30 espacios de parqueo (3 pisos x 10 espacios)
de la torre. Construida con **Vite + React** y **Supabase** (Auth + Postgres + Realtime).

## 1. Requisitos

- Node.js 18+
- Una cuenta y proyecto en [supabase.com](https://supabase.com)

## 2. Configurar Supabase

1. Crea un proyecto nuevo en Supabase.
2. Ve a **SQL Editor** y ejecuta el contenido completo de `supabase/schema.sql`.
   Esto crea las tablas `spots` y `visits`, siembra los 30 espacios,
   habilita Row Level Security y Realtime.
3. Ve a **Authentication > Users > Add user** y crea manualmente el usuario
   del guarda de seguridad (correo + contraseña). No hay pantalla de
   registro en la app: el usuario se agrega directamente aquí, por solicitud.
4. Ve a **Project Settings > API** y copia:
   - `Project URL`
   - `anon public key`

## 3. Configurar el proyecto local

```bash
cp .env.example .env
```

Edita `.env` y pega tus valores reales:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

## 4. Instalar y correr

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`. Inicia sesión con el usuario que creaste en el paso 2.3.

## 5. Desplegar en Vercel

1. Sube el proyecto a un repositorio de GitHub.
2. Impórtalo en Vercel.
3. Agrega las variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
   en **Project Settings > Environment Variables** de Vercel.
4. Deploy.

## Pruebas

Este proyecto tiene tres niveles de pruebas automatizadas:

### Unitarias y de componente (rápidas, sin red)

```bash
npm run test          # corre una vez
npm run test:watch    # modo watch, para desarrollo
```

No necesitan ningún proyecto de Supabase — corren en milisegundos y son las que
deberían correr en cada commit / Pull Request.

### Integración (necesitan un proyecto Supabase dedicado a pruebas)

Estas SÍ hablan con una base de datos real, para comprobar las restricciones que
solo existen en Postgres (índices únicos, RLS). **Nunca las corras contra el
proyecto real de la app** — usan una service_role key que ignora todos los
permisos, y borran la tabla `visits` completa antes de cada prueba.

1. Crea un **segundo proyecto en Supabase**, dedicado exclusivamente a pruebas.
2. Ejecuta `supabase/schema.sql` ahí también (SQL Editor, igual que en el proyecto real).
3. Crea un usuario de prueba en **Authentication > Users** de ese proyecto
   (el mismo rol que el guarda real, solo que dedicado a pruebas).
4. Copia `.env.test.example` a `.env.test` y completa:
   - `SUPABASE_URL` / `SUPABASE_ANON_KEY` — Project Settings > API
   - `SUPABASE_SERVICE_ROLE_KEY` — Project Settings > API, sección "service_role"
     (marcada como secreta; nunca la subas a git ni la uses en el proyecto real)
   - `TEST_USER_EMAIL` / `TEST_USER_PASSWORD` — el usuario creado en el paso 3
5. Corre:
   ```bash
   npm run test:integration
   ```

Si `.env.test` no existe o le falta algún valor, las pruebas fallan de inmediato
con un mensaje explicando qué falta, en vez de un timeout de red confuso.

### End-to-end (navegador real, contra el mismo proyecto de prueba)

Simulan el flujo completo del guarda: login, cambiar de piso, registrar
entrada, ver el bloqueo por apartamento duplicado, registrar salida, y
filtrar el historial. Usan **Playwright** y corren contra el mismo proyecto
Supabase de prueba de la sección anterior — no necesitan un tercer proyecto.

1. Asegurate de tener `.env.test` configurado (sección anterior) — de ahí
   salen las credenciales del usuario de prueba para hacer login.
2. Instala los navegadores de Playwright (solo la primera vez):
   ```bash
   npx playwright install chromium
   ```
3. Corre las pruebas:
   ```bash
   npm run test:e2e
   ```
   o, para verlas correr en modo interactivo (muy útil para depurar):
   ```bash
   npm run test:e2e:ui
   ```

Playwright levanta automáticamente la app (`npm run dev:e2e`, que usa
`.env.test`) antes de correr las pruebas, y la apaga al terminar — no hace
falta tener `npm run dev` corriendo aparte. De hecho, es mejor que **no**
lo tengas corriendo con tu `.env` real al mismo tiempo, para no confundir
puertos.

## Estructura del proyecto

```
src/
  App.jsx                  Orquesta login, grid, modales e historial
  supabaseClient.js        Cliente de Supabase (usa variables de entorno)
  hooks/
    useAuth.js               Sesión del guarda (HU-02)
    useSpots.js               Espacios + visita activa, con Realtime (HU-03, HU-04)
  components/
    Login.jsx                Inicio de sesión (HU-02)
    Header.jsx                 Encabezado + botón historial (HU-09)
    FloorSelector.jsx           Panel de pisos estilo ascensor (HU-04)
    ParkingGrid.jsx               Cuadrícula de espacios (HU-03)
    SpotTile.jsx                    Cuadro individual de espacio
    EntryModal.jsx                Registrar entrada (HU-05, HU-06)
    DetailModal.jsx                 Ver detalle y registrar salida (HU-07, HU-08)
    HistoryPanel.jsx                  Historial con filtros (HU-10)
  utils/                    Lógica pura, extraída para ser comprobable de forma aislada
    validation.js             Validación de apartamento, placa y formulario
    spots.js                    Código de espacio, conteo de disponibles, estado
    format.js                     Formato de fecha/hora
    history.js                      Filtro de historial por placa
tests/
  unit/                     Pruebas unitarias, un archivo por módulo de utils/
  components/               Pruebas de componente (React Testing Library)
  integration/              Pruebas contra una base de datos Supabase real de prueba
  e2e/                      Pruebas end-to-end con Playwright, navegador real
database/
  schema.sql                Tablas, seed de 30 espacios, RLS, Realtime
```

## Reglas de negocio clave (y dónde viven)

- **Un espacio de visita por apartamento a la vez**: garantizado con un
  índice único parcial en Postgres (`one_active_visit_per_apartment`),
  no solo validación de frontend. Si se viola, la app muestra el error
  correspondiente.
- **Un espacio no puede tener dos visitas activas**: mismo mecanismo
  (`one_active_visit_per_spot`), evita condiciones de carrera si dos
  personas registran al mismo tiempo.
- **Historial completo**: nunca se borran registros; una salida solo
  actualiza `exit_time` en la fila existente.

## Notas / simplificaciones para este entregable

- El catálogo de apartamentos (HU-11, prioridad baja) se valida por rango
  (1-30) en el formulario, sin tabla `apartments` separada, para mantener
  el alcance del MVP. Se puede agregar después si se necesita validar
  contra una lista real de propietarios.
- Las credenciales de Supabase en `.env.example` son placeholders;
  reemplázalas con las de tu proyecto real antes de correr la app.
