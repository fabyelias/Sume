// Parsea "HH:MM–HH:MM" o "HH:MM-HH:MM" y retorna [inicioMin, finMin].
function parseTurno(turno: string): [number, number] | null {
  const m = turno.match(/(\d{1,2}):(\d{2})[^0-9]+(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return [parseInt(m[1]) * 60 + parseInt(m[2]), parseInt(m[3]) * 60 + parseInt(m[4])];
}

// Minutos de hora extra: tiempo trabajado después del horario previsto.
export function calcularMinutosExtra(turno: string, horaCierre: string): number {
  const parsed = parseTurno(turno);
  if (!parsed) return 0;
  const [inicioMin, finPrevisto] = parsed;
  const [hC, mC] = horaCierre.split(":").map(Number);
  let cierreMin = hC * 60 + mC;
  let finEfectivo = finPrevisto;
  // Turno nocturno: el fin cae al día siguiente
  if (finPrevisto <= inicioMin) {
    finEfectivo = finPrevisto + 24 * 60;
    if (cierreMin < inicioMin) cierreMin += 24 * 60;
  }
  return Math.max(0, cierreMin - finEfectivo);
}

// Minutos de tardanza: tiempo llegado después del inicio previsto.
export function calcularMinutosTarde(turno: string, horaIngreso: string): number {
  const parsed = parseTurno(turno);
  if (!parsed) return 0;
  const [inicioMin] = parsed;
  const [hI, mI] = horaIngreso.split(":").map(Number);
  let ingresoMin = hI * 60 + mI;
  // Turno nocturno: si el inicio es tarde y el ingreso es madrugada, cruza medianoche
  if (inicioMin >= 12 * 60 && ingresoMin < 12 * 60) ingresoMin += 24 * 60;
  return Math.max(0, ingresoMin - inicioMin);
}

// Formatea minutos como "15 min", "1 h", "1 h 15 min".
export function formatMinutos(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}
