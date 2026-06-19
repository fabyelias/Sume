# SUME SALUD

Monorepo de la app de gestión de guardias y flota de SUME SALUD.

## Estructura

```
apps/
  api/   Express + TypeScript + Prisma, conectado a PostgreSQL (Supabase)
  web/   Vite + React + TypeScript + Tailwind
```

- **apps/api**: expone `/api/*`. Datos de catálogo (médicos, bases, paramédicos,
  personal, móviles) viven en tablas propias de Postgres. El estado operativo
  del día a día (asignaciones, cierres, turnos semanales, guardias médicas,
  PINes, presencias) vive en una tabla `Store` clave/valor (`/api/store/:key`),
  heredada 1:1 del prototipo original (que usaba `window.storage`).
- **apps/web**: 4 paneles por rol — Jefe de Paramédicos, Paramédico, Médico,
  Mecánico/Farmacia — en `src/features/<rol>`. Componentes compartidos en
  `src/components/shared`. Cliente HTTP en `src/lib/api.ts`.

> El panel Mecánico/Farmacia todavía usa datos de demo en memoria
> (`src/features/mecanico/data.ts`), igual que el prototipo original: no
> persiste a la base. Se puede migrar al mismo patrón `Store` cuando haga falta.

## Arrancar en desarrollo

```bash
npm install

# Terminal 1
npm run dev:api    # http://localhost:4000

# Terminal 2
npm run dev:web    # http://localhost:5173 (proxea /api al puerto 4000)
```

## Base de datos

`apps/api/.env` (no versionado) tiene el `DATABASE_URL` de Supabase.

```bash
npm run prisma:generate   # genera el cliente de Prisma
npm run prisma:migrate    # aplica migraciones
npm run prisma:seed       # carga los datos de catálogo de ejemplo
```

## Deploy

Los dos servicios (API y web) se despliegan como **proyectos separados** en
Vercel, cada uno apuntando al mismo repo con distinto Root Directory.

### API → Vercel (Root Directory `apps/api`)

Vercel reconoce automáticamente el preset **"Express.js"** porque `express`
está en las dependencias. Esa convención exige que `apps/api/src/app.ts`
tenga el app de Express como **export default** (además del export con
nombre que usan `src/index.ts` y Render) — Vercel importa ese archivo
directamente como función serverless, sin pasar por `app.listen()`.

1. New Project → importar `fabyelias/Sume` → **Root Directory: `apps/api`**.
2. Framework Preset: debería autodetectar **"Express"**. El `postinstall`
   corre `prisma generate` durante el install.
3. Variables de entorno → `DATABASE_URL`. **Importante**: para serverless usá
   la cadena de **connection pooling** de Supabase (Project Settings →
   Database → Connection pooling, modo *Transaction*, puerto `6543`), no la
   conexión directa de puerto `5432` — cada invocación es una conexión nueva
   y la directa se queda sin slots rápido. La de `apps/api/.env` (directa) la
   seguís usando solo en local, para correr migraciones.
4. Deploy. Te va a quedar una URL tipo `https://sume-api.vercel.app`.

### Web → Vercel (Root Directory `apps/web`)

1. New Project → mismo repo → **Root Directory: `apps/web`**.
2. Framework Preset: Vite (autodetectado).
3. Variable de entorno `VITE_API_URL` = la URL del paso anterior, sin `/`
   al final (ej. `https://sume-api.vercel.app`).
4. Deploy.

### Alternativa para la API: Render

También se puede desplegar `apps/api` en Render como servidor tradicional
(`render.yaml` en la raíz ya está listo: Root Directory `apps/api`, build
`npm install && npm run build`, start `npm start`, conexión directa de
Postgres sin pooler). Útil si en algún momento se prefiere no depender del
modelo serverless.
