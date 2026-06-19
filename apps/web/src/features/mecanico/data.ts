import type { StockItem } from "./types";

// El estado de flota (mecánica/terapia/bolsos por móvil) ya viene de la API
// (tabla Movil, la misma que usan Dirección y Flota). El stock de
// medicación/insumos todavía no tiene tabla propia: arranca vacío y vive
// solo en memoria del navegador hasta que se migre al mismo patrón Store
// que usan los demás paneles (ver src/lib/api.ts).
export const STOCK_INICIAL_MEC: Record<string, StockItem[]> = {};
