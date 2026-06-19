import type { MovilMec, StockItem } from "./types";

// Datos del panel Mecánico/Farmacia. En el prototipo original esta pantalla
// no persistía a window.storage (solo useState local); se mantiene igual
// acá. Cuando se necesite que sobreviva a un refresh / se comparta entre
// dispositivos, se migra al mismo patrón Store que usan los demás paneles
// (ver src/lib/api.ts). Los IDs de móvil (538, 542, 551) son reales; el
// resto arranca limpio para cargarse con datos reales durante el uso.
export const MOVILES_MEC: MovilMec[] = [
  {
    id: "538", km: 0, fecha: "—", para: "—", turno: "—", completo: false,
    items: [
      { id: "538-i1", label: "Sin choques", ok: true },
      { id: "538-i2", label: "Aceite", ok: true },
      { id: "538-i3", label: "Agua", ok: true },
      { id: "538-i4", label: "Frenos", ok: true },
      { id: "538-i5", label: "Electrocardiógrafo", ok: true },
    ],
    medicacion: [],
  },
  {
    id: "542", km: 0, fecha: "—", para: "—", turno: "—", completo: false,
    items: [
      { id: "542-i1", label: "Sin choques", ok: true },
      { id: "542-i2", label: "Aceite", ok: true },
      { id: "542-i3", label: "Frenos", ok: true },
    ],
    medicacion: [],
  },
  {
    id: "551", km: 0, fecha: "—", para: "—", turno: "—", completo: false,
    items: [{ id: "551-i1", label: "Sin choques", ok: true }],
    medicacion: [],
  },
];

export const STOCK_INICIAL_MEC: Record<string, StockItem[]> = {
  "538": [],
  "542": [],
  "551": [],
};
