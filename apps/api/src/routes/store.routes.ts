import { Router } from "express";
import { prisma } from "../lib/prisma";

export const storeRouter = Router();

// Claves válidas para el estado operativo del día (equivalentes a las
// sume:* que usaba el prototipo en window.storage).
const VALID_KEYS = new Set([
  "asignaciones",
  "cierres",
  "guardias_medicos",
  "pines_medicos",
  "presencia_medicos",
  "checklist_paramedicos",
  "francos",
]);

storeRouter.get("/:key", async (req, res) => {
  const { key } = req.params;
  if (!VALID_KEYS.has(key)) return res.status(404).json({ error: "Clave desconocida" });
  const row = await prisma.store.findUnique({ where: { key } });
  res.json(row?.value ?? {});
});

storeRouter.put("/:key", async (req, res) => {
  const { key } = req.params;
  if (!VALID_KEYS.has(key)) return res.status(404).json({ error: "Clave desconocida" });
  const row = await prisma.store.upsert({
    where: { key },
    update: { value: req.body },
    create: { key, value: req.body },
  });
  res.json(row.value);
});
