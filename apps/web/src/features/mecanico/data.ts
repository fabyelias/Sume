import type { MovilMec, StockItem } from "./types";

// Datos de demo del panel Mecánico/Farmacia. En el prototipo original esta
// pantalla no persistía a window.storage (solo useState local); se mantiene
// igual acá. Cuando se necesite que sobreviva a un refresh / se comparta
// entre dispositivos, se migra al mismo patrón Store que usan los demás
// paneles (ver src/lib/api.ts).
export const MOVILES_MEC: MovilMec[] = [
  {
    id: "538", km: 128430, fecha: "Hoy 06:55", para: "L. Fernández", turno: "07-19", completo: true,
    items: [
      { id: "538-i1", label: "Sin choques", ok: true },
      { id: "538-i2", label: "Aceite", ok: true },
      { id: "538-i3", label: "Agua", ok: true },
      { id: "538-i4", label: "Frenos", ok: true },
      {
        id: "538-i5", label: "Electrocardiógrafo", ok: false, detalle: "No enciende, probé con otro cargador.", foto: true, estado: "abierto",
        bitacora: [{ autor: "L. Fernández", rol: "para", hora: "Hoy 06:55", texto: "No enciende, probé con otro cargador.", foto: true }],
      },
    ],
    medicacion: [{ nombre: "Midazolam 15mg", estado: "por_vencer", vence: "2026-06-18" }],
  },
  {
    id: "542", km: 96345, fecha: "Hoy 06:55", para: "C. Ibarra", turno: "07-19", completo: true,
    items: [
      {
        id: "542-i1", label: "Sin choques", ok: false, detalle: "Golpe leve en paragolpe trasero.", foto: true, estado: "abierto",
        bitacora: [{ autor: "C. Ibarra", rol: "para", hora: "Hoy 06:55", texto: "Golpe leve en paragolpe trasero.", foto: true }],
      },
      {
        id: "542-i2", label: "Aceite", ok: false, detalle: "Por debajo del mínimo.", foto: false, estado: "en_proceso",
        bitacora: [
          { autor: "C. Ibarra", rol: "para", hora: "Hoy 06:55", texto: "Por debajo del mínimo.", foto: false },
          { autor: "Taller", rol: "mec", hora: "09:10", texto: "Se completó nivel, pendiente revisar pérdida.", foto: false },
        ],
      },
      {
        id: "542-i3", label: "Frenos", ok: false, detalle: "Ruido metálico al frenar.", foto: false, estado: "abierto",
        bitacora: [{ autor: "C. Ibarra", rol: "para", hora: "Hoy 06:55", texto: "Ruido metálico al frenar.", foto: false }],
      },
    ],
    medicacion: [{ nombre: "Adrenalina 1mg", estado: "vencido", vence: "2026-06-15" }],
  },
  {
    id: "551", km: 154920, fecha: "Ayer 19:05", para: "D. Paredes", turno: "19-07", completo: false,
    items: [{ id: "551-i1", label: "Sin choques", ok: true }],
    medicacion: [{ nombre: "Lidocaína 2%", estado: "por_vencer", vence: "2026-06-22" }],
  },
];

export const STOCK_INICIAL_MEC: Record<string, StockItem[]> = {
  "538": [
    { nombre: "Adrenalina 1mg", cantidad: 4, minimo: 3, vence: "2026-07-02", estado: "ok" },
    { nombre: "Midazolam 15mg", cantidad: 2, minimo: 2, vence: "2026-06-18", estado: "por_vencer" },
  ],
  "542": [
    { nombre: "Adrenalina 1mg", cantidad: 1, minimo: 3, vence: "2026-06-15", estado: "vencido" },
    { nombre: "Atropina 1mg", cantidad: 3, minimo: 2, vence: "2026-08-10", estado: "ok" },
  ],
  "551": [{ nombre: "Adrenalina 1mg", cantidad: 5, minimo: 3, vence: "2026-09-20", estado: "ok" }],
};
