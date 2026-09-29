import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FormularioCredenciales } from "@/components/autenticacion/formulario-credenciales";
import { LONGITUD_MINIMA_CONTRASENA } from "@/lib/autenticacion/validacion";
import { registrarse } from "../acciones";

export const metadata: Metadata = {
  title: "Crear cuenta · Ahorrito",
};

export default function PaginaRegistro() {
  return (
    <main className="flex min-h-dvh w-full items-center justify-center px-5 py-12 sm:py-16">
      <section aria-labelledby="titulo-registro" className="superficie w-full max-w-md p-6 sm:p-8">
        <Link
          href="/"
          aria-label="Ahorrito, ir al inicio"
          className="inline-flex min-h-11 items-center rounded-xl"
        >
          <Image src="/ahorrito-logo.svg" alt="Ahorrito" width={160} height={47} className="h-auto w-40" />
        </Link>

        <h1 id="titulo-registro" className="mt-8 text-3xl font-black tracking-tight text-texto">
          Crear cuenta
        </h1>
        <p className="mt-3 leading-7 text-texto-suave">
          Registra tu correo para guardar tus planes semanales.
        </p>

        <FormularioCredenciales
          accion={registrarse}
          textoBoton="Crear cuenta"
          autocompletarContrasena="new-password"
          ayudaContrasena={`Mínimo ${LONGITUD_MINIMA_CONTRASENA} caracteres.`}
        />

        <p className="mt-7 border-t border-borde pt-6 text-sm text-texto-suave">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/iniciar-sesion"
            className="inline-flex min-h-11 items-center font-bold text-texto underline decoration-2 underline-offset-4"
          >
            Inicia sesión
          </Link>
        </p>
      </section>
    </main>
  );
}
