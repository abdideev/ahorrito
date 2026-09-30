import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Demostración del motor · Ahorrito",
  description: "Prueba el motor de planificación semanal de Ahorrito sin iniciar sesión.",
};

export default function LayoutDemostracion({ children }: { children: ReactNode }) {
  return children;
}
