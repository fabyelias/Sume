import type {
  Asignaciones,
  Base,
  Cierres,
  GuardiasMedicas,
  Medico,
  Movil,
  Paramedico,
  Personal,
  Pines,
  Presencias,
  Turnos,
} from "../types";

// En dev, el proxy de Vite reenvía /api al backend local. En producción
// (Vercel) no hay proxy, así que apunta a la API desplegada en Render vía
// VITE_API_URL (ver apps/web/.env.example).
const API_BASE = import.meta.env.VITE_API_URL ?? "";

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`);
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return res.json();
}

async function putJSON<T>(path: string, body: T): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT ${path} → ${res.status}`);
  return res.json();
}

export const api = {
  medicos: () => getJSON<Medico[]>("/medicos"),
  bases: () => getJSON<Base[]>("/bases"),
  paramedicos: () => getJSON<Paramedico[]>("/paramedicos"),
  personal: () => getJSON<Personal[]>("/personal"),
  moviles: () => getJSON<Movil[]>("/moviles"),

  getAsignaciones: () => getJSON<Asignaciones>("/store/asignaciones"),
  setAsignaciones: (v: Asignaciones) => putJSON("/store/asignaciones", v),

  getCierres: () => getJSON<Cierres>("/store/cierres"),
  setCierres: (v: Cierres) => putJSON("/store/cierres", v),

  getTurnos: () => getJSON<Turnos>("/store/turnos"),
  setTurnos: (v: Turnos) => putJSON("/store/turnos", v),

  getGuardiasMedicas: () => getJSON<GuardiasMedicas>("/store/guardias_medicos"),
  setGuardiasMedicas: (v: GuardiasMedicas) => putJSON("/store/guardias_medicos", v),

  getPines: () => getJSON<Pines>("/store/pines_medicos"),
  setPines: (v: Pines) => putJSON("/store/pines_medicos", v),

  getPresencias: () => getJSON<Presencias>("/store/presencia_medicos"),
  setPresencias: (v: Presencias) => putJSON("/store/presencia_medicos", v),
};
