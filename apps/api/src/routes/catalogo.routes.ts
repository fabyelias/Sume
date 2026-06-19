import { randomUUID } from "crypto";
import { Router } from "express";
import { prisma } from "../lib/prisma";

export const catalogoRouter = Router();

// Médicos
catalogoRouter.get("/medicos", async (_req, res) => {
  res.json(await prisma.medico.findMany());
});

catalogoRouter.post("/medicos", async (req, res) => {
  const { nombre, especialidad, telefono, movilFijo, turno } = req.body;
  if (!nombre) return res.status(400).json({ error: "Falta nombre" });
  const medico = await prisma.medico.create({
    data: { id: randomUUID(), nombre, especialidad: especialidad ?? "", telefono: telefono ?? "", movilFijo: movilFijo ?? "", turno: turno ?? "" },
  });
  res.status(201).json(medico);
});

catalogoRouter.put("/medicos/:id", async (req, res) => {
  const { nombre, especialidad, telefono, movilFijo, turno } = req.body;
  const medico = await prisma.medico.update({
    where: { id: req.params.id },
    data: { nombre, especialidad, telefono, movilFijo, turno },
  });
  res.json(medico);
});

catalogoRouter.delete("/medicos/:id", async (req, res) => {
  await prisma.medico.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

// Bases (solo lectura: son fijas)
catalogoRouter.get("/bases", async (_req, res) => {
  res.json(await prisma.base.findMany());
});

// Paramédicos
catalogoRouter.get("/paramedicos", async (_req, res) => {
  res.json(await prisma.paramedico.findMany());
});

catalogoRouter.post("/paramedicos", async (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: "Falta nombre" });
  const paramedico = await prisma.paramedico.create({ data: { nombre } });
  res.status(201).json(paramedico);
});

catalogoRouter.put("/paramedicos/:nombre", async (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: "Falta nombre" });
  const paramedico = await prisma.paramedico.update({ where: { nombre: req.params.nombre }, data: { nombre } });
  res.json(paramedico);
});

catalogoRouter.delete("/paramedicos/:nombre", async (req, res) => {
  await prisma.paramedico.delete({ where: { nombre: req.params.nombre } });
  res.status(204).end();
});

// Personal (RRHH)
catalogoRouter.get("/personal", async (_req, res) => {
  res.json(await prisma.personal.findMany());
});

catalogoRouter.post("/personal", async (req, res) => {
  const { nombre, rol, guardia, estado, horas, faltas, tardes } = req.body;
  if (!nombre) return res.status(400).json({ error: "Falta nombre" });
  const personal = await prisma.personal.create({
    data: {
      nombre,
      rol: rol ?? "",
      guardia: guardia ?? "",
      estado: estado ?? "presente",
      horas: horas ?? 0,
      faltas: faltas ?? 0,
      tardes: tardes ?? 0,
    },
  });
  res.status(201).json(personal);
});

catalogoRouter.put("/personal/:id", async (req, res) => {
  const { nombre, rol, guardia, estado, horas, faltas, tardes } = req.body;
  const personal = await prisma.personal.update({
    where: { id: Number(req.params.id) },
    data: { nombre, rol, guardia, estado, horas, faltas, tardes },
  });
  res.json(personal);
});

catalogoRouter.delete("/personal/:id", async (req, res) => {
  await prisma.personal.delete({ where: { id: Number(req.params.id) } });
  res.status(204).end();
});

// Móviles (solo lectura: son fijos)
catalogoRouter.get("/moviles", async (_req, res) => {
  res.json(await prisma.movil.findMany());
});
