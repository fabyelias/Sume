import { useState } from "react";
import { Launcher, type Perfil } from "./components/Launcher";
import { PanelMecanico } from "./features/mecanico/PanelMecanico";
import { PanelMedico } from "./features/medico/PanelMedico";
import { PanelJefe } from "./features/jefe/PanelJefe";
import { PanelParamedico } from "./features/paramedico/PanelParamedico";

export function App() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);

  if (!perfil) return <Launcher onSelect={setPerfil} />;
  if (perfil === "jefe") return <PanelJefe onBack={() => setPerfil(null)} />;
  if (perfil === "paramedico") return <PanelParamedico onBack={() => setPerfil(null)} />;
  if (perfil === "mecanico") return <PanelMecanico onBack={() => setPerfil(null)} />;
  if (perfil === "medico") return <PanelMedico onBack={() => setPerfil(null)} />;
  return null;
}
