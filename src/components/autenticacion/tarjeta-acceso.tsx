import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Aparecer } from "@/components/ui/movimiento";
import { RUTA_INICIO_SESION } from "@/lib/autenticacion/rutas";
import { TransicionRuta } from "@/components/ui/transicion-ruta";

interface Props {
  pantalla: "registro" | "inicio-sesion";
  idTitulo: string;
  titulo: string;
  descripcion: string;
  children: ReactNode;
}

const PESTANAS = [
  { pantalla: "registro", href: "/registro", texto: "Crear cuenta" },
  { pantalla: "inicio-sesion", href: RUTA_INICIO_SESION, texto: "Iniciar sesión" },
] as const;

/**
 * Marco común del registro y el inicio de sesión (RF-01).
 *
 * Las pestañas son enlaces de navegación y no un `tablist`: cada una lleva a otra URL
 * con su propio título y su propio formulario, que es lo que un lector de pantalla debe
 * anunciar. La activa se marca con `aria-current="page"`.
 */
export function TarjetaAcceso({ pantalla, idTitulo, titulo, descripcion, children }: Props) {
  return (
    <TransicionRuta>
      <main className="flex min-h-dvh w-full items-center justify-center px-4 py-10 sm:py-16">
        <Aparecer como="section" aria-labelledby={idTitulo} className="tarjeta relative w-full max-w-md p-6 sm:p-8">
          <AnimatedThemeToggler className="absolute top-4 right-4" />
          <div className="flex justify-center">
            <Link
              href="/"
              aria-label="Ahorrito, ir al inicio"
              className="inline-flex min-h-11 items-center rounded-xl"
            >
              <Image src="/ahorrito-logo.svg" alt="Ahorrito" width={160} height={47} className="h-auto w-36 dark:brightness-[2.6]" />
            </Link>
          </div>

          <nav aria-label="Acceso a la cuenta" className="mt-6">
            <ul className="grid grid-cols-2 gap-1 rounded-2xl bg-superficie-hundida p-1">
              {PESTANAS.map((pestana) => {
                const activa = pestana.pantalla === pantalla;
                return (
                  <li key={pestana.pantalla}>
                    <Link
                      href={pestana.href}
                      aria-current={activa ? "page" : undefined}
                      className={`flex min-h-11 items-center justify-center rounded-xl px-3 text-sm font-semibold ${
                        activa
                          ? "bg-tarjeta text-texto shadow-sm"
                          : "text-texto-suave hover:text-texto"
                      }`}
                    >
                      {pestana.texto}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <h1 id={idTitulo} className="mt-8 text-center text-3xl font-extrabold tracking-tight text-texto">
            {titulo}
          </h1>
          <p className="mt-2 text-center leading-7 text-texto-suave">{descripcion}</p>

          {children}
        </Aparecer>
      </main>
    </TransicionRuta>
  );
}
