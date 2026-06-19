import { Router } from "express";
import { prisma } from "../lib/prisma";

export const reportesRouter = Router();

reportesRouter.get("/", async (req, res) => {
  const { movilId, estado } = req.query;
  res.json(
    await prisma.reporte.findMany({
      where: {
        ...(typeof movilId === "string" ? { movilId } : {}),
        ...(typeof estado === "string" ? { estado } : {}),
      },
      orderBy: { createdAt: "desc" },
    }),
  );
});

reportesRouter.post("/", async (req, res) => {
  const { movilId, categoria, texto, foto, autor } = req.body;
  if (!movilId || !texto || !autor) return res.status(400).json({ error: "Falta movilId, texto o autor" });
  const reporte = await prisma.reporte.create({
    data: { movilId, categoria: categoria ?? "otro", texto, foto: !!foto, autor },
  });
  res.status(201).json(reporte);
});

reportesRouter.put("/:id", async (req, res) => {
  const { estado, respuesta, respondidoPor } = req.body;
  const reporte = await prisma.reporte.update({
    where: { id: req.params.id },
    data: { estado, respuesta, respondidoPor },
  });
  res.json(reporte);
});
