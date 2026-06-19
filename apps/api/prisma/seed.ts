import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.medico.createMany({
    data: [
      { id: "med1", nombre: "Dr. Ramírez", especialidad: "Emergentología", telefono: "11-4523-8891", movilFijo: "531", turno: "07:00–19:00" },
      { id: "med2", nombre: "Dra. Paredes", especialidad: "Clínica Médica", telefono: "11-6712-3344", movilFijo: "530", turno: "07:00–19:00" },
      { id: "med3", nombre: "Dr. Suárez", especialidad: "Emergentología", telefono: "11-5533-2210", movilFijo: "527", turno: "08:00–20:00" },
      { id: "med4", nombre: "Dr. Villalba", especialidad: "Medicina General", telefono: "11-4891-6677", movilFijo: "Kangoo", turno: "Variable" },
    ],
    skipDuplicates: true,
  });

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

  await prisma.paramedico.createMany({
    data: ["L. Fernández", "R. Gómez", "C. Ibarra", "D. Paredes", "M. Suárez"].map((nombre) => ({ nombre })),
    skipDuplicates: true,
  });

  await prisma.personal.createMany({
    data: [
      { nombre: "L. Fernández", rol: "Paramédico", guardia: "07:00-19:00", estado: "presente", horas: 312, faltas: 1, tardes: 0 },
      { nombre: "R. Gómez", rol: "Paramédico", guardia: "07:00-19:00", estado: "presente", horas: 298, faltas: 2, tardes: 3 },
      { nombre: "C. Ibarra", rol: "Paramédico", guardia: "19:00-07:00", estado: "presente", horas: 340, faltas: 0, tardes: 1 },
      { nombre: "Dr. Suárez", rol: "Médico", guardia: "07:00-19:00", estado: "ausente", horas: 280, faltas: 4, tardes: 2 },
      { nombre: "D. Paredes", rol: "Paramédico", guardia: "19:00-07:00", estado: "tarde", horas: 305, faltas: 1, tardes: 5 },
    ],
  });

  await prisma.movil.createMany({
    data: [
      {
        id: "538", nombre: "Unidad Avanzada", estado: "activo", km: 128430, ultimaRevision: "Hoy 07:40",
        mecanica: { aceite: true, agua: true, frenos: true, chocado: false },
        electro: { dea: true, ciclador: false },
        oxigeno: { c: 2, cOk: 2, m: 2, mOk: 1 },
        bolsos: { via: true, paro: true, maletin: true, trauma: false },
        dotDia: { para: "L. Fernández", med: "Dr. Ramírez", turno: "07-19" },
        dotNoche: { para: "R. Gómez", med: "—", turno: "19-07" },
      },
      {
        id: "542", nombre: "Unidad Básica", estado: "taller", km: 96345, ultimaRevision: "Ayer 19:15",
        mecanica: { aceite: true, agua: false, frenos: false, chocado: true },
        electro: { dea: true, ciclador: true },
        oxigeno: { c: 2, cOk: 2, m: 2, mOk: 2 },
        bolsos: { via: true, paro: true, maletin: true, trauma: true },
        dotDia: { para: "C. Ibarra", med: "Dra. Paredes", turno: "07-19" },
        dotNoche: { para: "D. Paredes", med: "—", turno: "19-07" },
      },
      {
        id: "551", nombre: "Unidad Avanzada", estado: "activo", km: 154920, ultimaRevision: "Hoy 06:55",
        mecanica: { aceite: true, agua: true, frenos: true, chocado: false },
        electro: { dea: true, ciclador: true },
        oxigeno: { c: 2, cOk: 1, m: 2, mOk: 2 },
        bolsos: { via: true, paro: true, maletin: true, trauma: true },
        dotDia: { para: "D. Paredes", med: "Dr. Suárez", turno: "07-19" },
        dotNoche: { para: "L. Fernández", med: "—", turno: "19-07" },
      },
    ],
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
