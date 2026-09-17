import type { Metadata } from "next";
import Link from "next/link";
import { FormularioCredenciales } from "@/components/autenticacion/formulario-credenciales";
import { RUTA_PANEL, rutaInternaSegura } from "@/lib/autenticacion/rutas";
import { iniciarSesion } from "../acciones";

export const metadata: Metadata = {
  title: "Iniciar sesión · Ahorrito",
};

interface Props {
  searchParams: Promise<{ siguiente?: string | string[]; error?: string | string[] }>;
}

export default async function PaginaInicioSesion({ searchParams }: Props) {
  const { siguiente, error } = await searchParams;
  const destino = rutaInternaSegura(Array.isArray(siguiente) ? siguiente[0] : siguiente, RUTA_PANEL);
  const falloConfirmacion = error === "confirmacion";

  return (
    <main className="mx-auto w-full max-w-md px-6 py-16">
      <h1 className="text-3xl font-semibold">Iniciar sesión</h1>

      {falloConfirmacion && (
        <p role="alert" className="mt-4 rounded border border-red-600 p-3 text-sm text-red-700 dark:text-red-400">
          No pudimos abrir tu sesión desde el enlace. Si lo abriste en otro navegador, tu correo pudo quedar confirmado: inicia sesión con tu contraseña. Si el enlace expiró, vuelve a registrarte.
        </p>
      )}

      <FormularioCredenciales
        accion={iniciarSesion}
        textoBoton="Iniciar sesión"
        autocompletarContrasena="current-password"
        siguiente={destino}
      />

      <p className="mt-6 text-sm">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-medium underline underline-offset-2">
          Crea una
        </Link>
      </p>
    </main>
  );
}
