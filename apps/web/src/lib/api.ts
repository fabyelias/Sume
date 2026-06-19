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

async function putJSON<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT ${path} → ${res.status}`);
  return res.json();
}

async function postJSON<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} → ${res.status}`);
  return res.json();
}

async function del(path: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api${path}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`DELETE ${path} → ${res.status}`);
}

export const api = {
  medicos: () => getJSON<Medico[]>("/medicos"),
  crearMedico: (m: Omit<Medico, "id">) => postJSON<Medico>("/medicos", m),
  editarMedico: (id: string, m: Omit<Medico, "id">) => putJSON<Medico>(`/medicos/${id}`, m),
  borrarMedico: (id: string) => del(`/medicos/${id}`),

  bases: () => getJSON<Base[]>("/bases"),

  paramedicos: () => getJSON<Paramedico[]>("/paramedicos"),
  crearParamedico: (nombre: string) => postJSON<Paramedico>("/paramedicos", { nombre }),
  borrarParamedico: (nombre: string) => del(`/paramedicos/${encodeURIComponent(nombre)}`),

  personal: () => getJSON<Personal[]>("/personal"),
  crearPersonal: (p: Omit<Personal, "id">) => postJSON<Personal>("/personal", p),
  editarPersonal: (id: number, p: Omit<Personal, "id">) => putJSON<Personal>(`/personal/${id}`, p),
  borrarPersonal: (id: number) => del(`/personal/${id}`),

  moviles: () => getJSON<Movil[]>("/moviles"),

  getAsignaciones: () => getJSON<Asignaciones>("/store/asignaciones"),
  setAsignaciones: (v: Asignaciones) => putJSON<Asignaciones>("/store/asignaciones", v),

  getCierres: () => getJSON<Cierres>("/store/cierres"),
  setCierres: (v: Cierres) => putJSON<Cierres>("/store/cierres", v),

  getTurnos: () => getJSON<Turnos>("/store/turnos"),
  setTurnos: (v: Turnos) => putJSON<Turnos>("/store/turnos", v),

  getGuardiasMedicas: () => getJSON<GuardiasMedicas>("/store/guardias_medicos"),
  setGuardiasMedicas: (v: GuardiasMedicas) => putJSON<GuardiasMedicas>("/store/guardias_medicos", v),

  getPines: () => getJSON<Pines>("/store/pines_medicos"),
  setPines: (v: Pines) => putJSON<Pines>("/store/pines_medicos", v),

  getPresencias: () => getJSON<Presencias>("/store/presencia_medicos"),
  setPresencias: (v: Presencias) => putJSON<Presencias>("/store/presencia_medicos", v),
};
