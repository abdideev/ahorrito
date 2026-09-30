import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { BarraApp } from "@/components/navegacion/barra-app";
import { RUTA_INICIO_SESION } from "@/lib/autenticacion/rutas";
import { obtenerUsuarioActual } from "@/lib/supabase/usuario";
import { cerrarSesion } from "../(auth)/acciones";

/**
 * Layout de las pantallas autenticadas. Segunda capa de protección: verifica la sesión
 * en el servidor aunque proxy.ts ya lo haya hecho, porque la guía de Next.js advierte
 * que el proxy es solo una comprobación optimista.
 *
 * También aporta la barra de navegación común al panel y al historial.
 */
export default async function LayoutAutenticado({ children }: { children: ReactNode }) {
  const usuario = await obtenerUsuarioActual();
  if (usuario === null) {
    redirect(RUTA_INICIO_SESION);
  }
  return (
    <>
      <a href="#contenido" className="salto-contenido">
        Saltar al contenido
      </a>
      <BarraApp correo={usuario.correo} cerrarSesion={cerrarSesion} />
      {children}
    </>
  );
}
