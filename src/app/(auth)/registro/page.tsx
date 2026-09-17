import type { Metadata } from "next";
import Link from "next/link";
import { FormularioCredenciales } from "@/components/autenticacion/formulario-credenciales";
import { LONGITUD_MINIMA_CONTRASENA } from "@/lib/autenticacion/validacion";
import { registrarse } from "../acciones";

export const metadata: Metadata = {
  title: "Crear cuenta · Ahorrito",
};

export default function PaginaRegistro() {
  return (
    <main className="mx-auto w-full max-w-md px-6 py-16">
      <h1 className="text-3xl font-semibold">Crear cuenta</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Registra tu correo para guardar tus planes semanales.
      </p>

      <FormularioCredenciales
        accion={registrarse}
        textoBoton="Crear cuenta"
        autocompletarContrasena="new-password"
        ayudaContrasena={`Mínimo ${LONGITUD_MINIMA_CONTRASENA} caracteres.`}
      />

      <p className="mt-6 text-sm">
        ¿Ya tienes cuenta?{" "}
        <Link href="/iniciar-sesion" className="font-medium underline underline-offset-2">
          Inicia sesión
        </Link>
      </p>
    </main>
  );
}
