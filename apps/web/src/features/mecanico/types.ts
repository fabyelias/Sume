export type EstadoTicket = "abierto" | "en_proceso" | "resuelto";

export type BitacoraEntrada = { autor: string; rol: "para" | "mec"; hora: string; texto: string; foto: boolean };

export type ChecklistItemMec = {
  id: string;
  label: string;
  ok: boolean;
  detalle?: string;
  foto?: boolean;
  estado?: EstadoTicket;
  bitacora?: BitacoraEntrada[];
};

export type MedicacionAlerta = { nombre: string; estado: "ok" | "por_vencer" | "vencido"; vence: string };

export type MovilMec = {
  id: string;
  km: number;
  fecha: string;
  para: string;
  turno: string;
  completo: boolean;
  items: ChecklistItemMec[];
  medicacion: MedicacionAlerta[];
};

export type StockItem = { nombre: string; cantidad: number; minimo: number; vence: string; estado: "ok" | "por_vencer" | "vencido" };
