import { app } from "./app";

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

// En Vercel no hay que abrir un puerto: el runtime invoca la función por
// request. Si este archivo termina siendo el entry point ahí (en vez de
// apps/api/api/index.ts), llamar a listen() dejaría la función colgada
// esperando conexiones que nunca van a llegar por esa vía.
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`API SUME SALUD escuchando en http://localhost:${port}`);
  });
}

export default app;
