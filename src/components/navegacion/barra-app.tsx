"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { IconoHistorial, IconoPanel, IconoSalir } from "@/components/ui/iconos";

interface Props {
  correo: string;
  /** Server Action de cierre de sesión (C-06). */
  cerrarSesion: () => Promise<void>;
}

const SECCIONES: { href: string; texto: string; icono: ReactNode }[] = [
  { href: "/panel", texto: "Panel", icono: <IconoPanel className="size-4" /> },
  { href: "/planes", texto: "Planes guardados", icono: <IconoHistorial className="size-4" /> },
];

/**
 * Barra superior de las pantallas autenticadas.
 *
 * Es de cliente solo para leer la ruta y marcar la sección activa con
 * `aria-current="page"`. No es fija: el panel lleva el foco al resultado del plan y una
 * barra fija taparía el descargo que CA-07 exige ver sin desplazarse.
 */
export function BarraApp({ correo, cerrarSesion }: Props) {
  const ruta = usePathname();

  return (
    <header className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6">
      <div className="tarjeta flex flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-5">
        <Link href="/panel" aria-label="Ahorrito, ir al panel" className="inline-flex min-h-11 items-center rounded-xl">
          <Image src="/ahorrito-logo.svg" alt="Ahorrito" width={160} height={47} className="h-auto w-28 sm:w-32 dark:brightness-[2.6]" />
        </Link>

        <nav aria-label="Secciones" className="order-last w-full sm:order-none sm:w-auto">
          <ul className="flex gap-1 rounded-2xl bg-superficie-hundida p-1">
            {SECCIONES.map((seccion) => {
              const activa = ruta === seccion.href;
              return (
                <li key={seccion.href} className="flex-1 sm:flex-none">
                  <Link
                    href={seccion.href}
                    aria-current={activa ? "page" : undefined}
                    className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold ${
                      activa ? "bg-tarjeta text-texto shadow-sm" : "text-texto-suave hover:text-texto"
                    }`}
                  >
                    {seccion.icono}
                    {seccion.texto}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <p className="hidden max-w-48 truncate text-sm text-texto-suave lg:block" title={correo}>
            <span className="sr-only">Sesión iniciada como </span>
            {correo}
          </p>
          <AnimatedThemeToggler />
          <form action={cerrarSesion}>
            {/* En móvil queda solo el icono para que la barra quepa en dos filas; el texto
                sigue disponible para lectores de pantalla. */}
            <button type="submit" title="Cerrar sesión" className="boton-secundario min-h-11 min-w-11 px-3 text-sm">
              <IconoSalir className="size-4" />
              <span className="sr-only sm:not-sr-only">Cerrar sesión</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
