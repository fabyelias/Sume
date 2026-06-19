import { Router } from "express";
import { prisma } from "../lib/prisma";

export const catalogoRouter = Router();

catalogoRouter.get("/medicos", async (_req, res) => {
  res.json(await prisma.medico.findMany());
});

catalogoRouter.get("/bases", async (_req, res) => {
  res.json(await prisma.base.findMany());
});

catalogoRouter.get("/paramedicos", async (_req, res) => {
  res.json(await prisma.paramedico.findMany());
});

catalogoRouter.get("/personal", async (_req, res) => {
  res.json(await prisma.personal.findMany());
});

catalogoRouter.get("/moviles", async (_req, res) => {
  res.json(await prisma.movil.findMany());
});
