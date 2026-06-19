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
