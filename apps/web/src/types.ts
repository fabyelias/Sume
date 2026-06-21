export type Medico = {
  id: string;
  nombre: string;
  especialidad: string;
  telefono: string;
  movilFijo: string;
  turno: string;
};

export type Base = { id: string; label: string; turno: string };

export type Paramedico = { nombre: string };

export type Personal = {
  id: number;
  nombre: string;
  rol: string;
  guardia: string;
  estado: "presente" | "ausente" | "tarde";
  horas: number;
  faltas: number;
  tardes: number;
};

export type Movil = {
  id: string;
  nombre: string;
  estado: "activo" | "taller" | "inactivo";
  km: number;
  ultimaRevision: string;
  mecanica: { aceite: boolean; agua: boolean; frenos: boolean; chocado: boolean };
  electro: { dea: boolean; ciclador: boolean };
  oxigeno: { c: number; cOk: number; m: number; mOk: number };
  bolsos: { via: boolean; paro: boolean; maletin: boolean; trauma: boolean };
  dotDia: { para: string; med: string; turno: string };
  dotNoche: { para: string; med: string; turno: string };
};

export type Asignacion = { base: string; baseId: string; movil: string; turno: string; medico?: string };
export type Asignaciones = Record<string, Asignacion>;

export type Cierre = { firmado: boolean; hora: string; movil: string; base: string; km: string; novedades: number };
export type Cierres = Record<string, Cierre>;

export type TurnoCelda = { libre: true } | { libre: false; base: string; baseId: string; movil: string; turno: string; medico?: string };
export type Turnos = Record<string, TurnoCelda>;

export type EstadoGuardiaMedica = "pendiente" | "en_camino" | "presente" | "ausente";
export type GuardiaMedica = {
  estado?: EstadoGuardiaMedica;
  horaIngreso?: string;
  horaFin?: string;
  movilAsig?: string;
  traslado?: string;
};
export type GuardiasMedicas = Record<string, GuardiaMedica>;

export type Pines = Record<string, string>;

export type Presencia = { confirmado: boolean; hora: string; movil: string; tarde?: boolean; minutosTarde?: number };
export type Presencias = Record<string, Presencia>;

// Snapshot persistido del checklist del paramédico para el día. Una vez
// enviado, sirve para que al volver a entrar al perfil quede bloqueado
// (no se vuelve a pedir) y solo se puedan seguir cargando novedades hasta
// que se firma el cierre.
export type ChecklistPM = {
  base: Base;
  movilFisico: string;
  ok: Record<string, boolean>;
  detalle: Record<string, { texto: string; foto: boolean }>;
  oxigeno: { centrales: number; centralesOk: number; manuales: number; manualesOk: number };
  km: string;
  enviado: boolean;
  firmado: boolean;
  horaCierre: string | null;
};
export type ChecklistsPM = Record<string, ChecklistPM>;

export type CategoriaReporte = "mecanica" | "medicacion" | "otro";
export type EstadoReporte = "abierto" | "en_proceso" | "resuelto";
export type Reporte = {
  id: string;
  movilId: string;
  categoria: CategoriaReporte;
  texto: string;
  foto: boolean;
  autor: string;
  estado: EstadoReporte;
  respuesta: string | null;
  respondidoPor: string | null;
  createdAt: string;
  updatedAt: string;
};
