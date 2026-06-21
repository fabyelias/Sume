// Constantes de referencia que no son entidades de catálogo en la base de
// datos, sino simples listas de opciones para los selectores de la UI.

// Fecha real de hoy (se calcula una vez al cargar la página). Antes estaba
// hardcodeada a una fecha fija, lo que hacía que todo lo confirmado por
// paramédicos/médicos quedara pegado para siempre y nunca "reseteara" al
// día siguiente.
const hoyDate = new Date();
export const HOY = `${hoyDate.getFullYear()}-${String(hoyDate.getMonth() + 1).padStart(2, "0")}-${String(hoyDate.getDate()).padStart(2, "0")}`;

export const MOVILES_FIS = ["538", "537", "531", "533", "532", "535", "Kangoo", "Polo 1", "Polo 2"];
export const MOVILES_MED = ["531", "530", "527", "Kangoo"];
