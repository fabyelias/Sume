import { app } from "../src/app";

// Punto de entrada para el runtime serverless de Vercel: una función por
// archivo bajo /api. Vercel acepta una app de Express exportada como
// default y la invoca directamente por request (no llama a app.listen()).
// vercel.json reescribe todas las rutas hacia esta función para que el
// ruteo interno de Express (/api/health, /api/medicos, /api/store/:key...)
// siga funcionando igual que en local/Render.
export default app;
