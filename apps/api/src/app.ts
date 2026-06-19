import cors from "cors";
import express from "express";
import { catalogoRouter } from "./routes/catalogo.routes";
import { storeRouter } from "./routes/store.routes";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api", catalogoRouter);
app.use("/api/store", storeRouter);

// El preset "Express.js" de Vercel busca este archivo y exige que el app
// de Express sea el export default (no alcanza con el export nombrado que
// ya usan src/index.ts y Render).
export default app;
