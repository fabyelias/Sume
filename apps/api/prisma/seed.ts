import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Solo datos reales y permanentes: bases y flota. Médicos, paramédicos y
// personal se cargan desde la app (Panel Jefe → Médicos / Personal) durante
// el uso real, no se siembran acá.
async function main() {
  await prisma.base.createMany({
    data: [
      { id: "b531", label: "Base 531", turno: "07:00–19:00" },
      { id: "b530", label: "Base 530", turno: "07:00–19:00" },
      { id: "tras", label: "Unidad Traslado", turno: "07:00–19:00" },
      { id: "b527", label: "Base 527", turno: "08:00–20:00" },
      { id: "mp1", label: "Móvil P1", turno: "08:00–20:00" },
      { id: "mp2", label: "Móvil P2", turno: "08:00–20:00" },
    ],
    skipDuplicates: true,
  });

  const MOVIL_LIMPIO = {
    estado: "activo", km: 0, ultimaRevision: "—",
    mecanica: { aceite: true, agua: true, frenos: true, chocado: false },
    electro: { dea: true, ciclador: true },
    oxigeno: { c: 2, cOk: 2, m: 2, mOk: 2 },
    bolsos: { via: true, paro: true, maletin: true, trauma: true },
    dotDia: { para: "—", med: "—", turno: "—" },
    dotNoche: { para: "—", med: "—", turno: "—" },
  };

  // Mismos identificadores que MOVILES_FIS en apps/web/src/data/constants.ts
  await prisma.movil.createMany({
    data: ["538", "537", "531", "533", "532", "535", "Kangoo", "Polo 1", "Polo 2"].map((id) => ({
      id,
      nombre: "Unidad",
      ...MOVIL_LIMPIO,
    })),
    skipDuplicates: true,
  });

  console.log("Seed completo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
