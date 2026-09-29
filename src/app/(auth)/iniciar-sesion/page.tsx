import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FormularioCredenciales } from "@/components/autenticacion/formulario-credenciales";
import { mensaje as claseMensaje } from "@/components/captura/estilos";
import { RUTA_PANEL, rutaInternaSegura } from "@/lib/autenticacion/rutas";
import { iniciarSesion } from "../acciones";

export const metadata: Metadata = {
  title: "Iniciar sesión · Ahorrito",
  description: "Accede a Ahorrito para organizar tus pagos y revisar tus planes guardados.",
};

interface Props {
  searchParams: Promise<{ siguiente?: string | string[]; error?: string | string[] }>;
}

export default async function PaginaInicioSesion({ searchParams }: Props) {
  const { siguiente, error } = await searchParams;
  const destino = rutaInternaSegura(Array.isArray(siguiente) ? siguiente[0] : siguiente, RUTA_PANEL);
  const falloConfirmacion = error === "confirmacion";

  return (
    <main className="flex min-h-dvh w-full items-center justify-center px-5 py-12 sm:py-16">
      <section aria-labelledby="titulo-inicio-sesion" className="superficie w-full max-w-md p-6 sm:p-8">
        <Link
          href="/"
          aria-label="Ahorrito, ir al inicio"
          className="inline-flex min-h-11 items-center rounded-xl"
        >
          <Image src="/ahorrito-logo.svg" alt="Ahorrito" width={160} height={47} className="h-auto w-40" />
        </Link>

        <h1 id="titulo-inicio-sesion" className="mt-8 text-3xl font-black tracking-tight text-texto">
          Iniciar sesión
        </h1>

        {falloConfirmacion && (
          <p role="alert" className={`${claseMensaje("error")} mt-5`}>
            No pudimos abrir tu sesión desde el enlace. Si lo abriste en otro navegador, tu correo pudo quedar confirmado: inicia sesión con tu contraseña. Si el enlace expiró, vuelve a registrarte.
          </p>
        )}

        <FormularioCredenciales
          accion={iniciarSesion}
          textoBoton="Iniciar sesión"
          autocompletarContrasena="current-password"
          siguiente={destino}
        />

        <p className="mt-7 border-t border-borde pt-6 text-sm text-texto-suave">
          ¿No tienes cuenta?{" "}
          <Link
            href="/registro"
            className="inline-flex min-h-11 items-center font-bold text-texto underline decoration-2 underline-offset-4"
          >
            Crea una
          </Link>
        </p>
      </section>
    </main>
  );
}
