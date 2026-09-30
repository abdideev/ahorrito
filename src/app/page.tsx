import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { IconoCalendario, IconoEscudo, IconoInfo, IconoTendencia } from "@/components/ui/iconos";
import { InteractiveHoverLink } from "@/components/ui/interactive-hover-button";
import { TransicionRuta } from "@/components/ui/transicion-ruta";

const beneficios: { titulo: string; descripcion: string; icono: ReactNode }[] = [
  {
    titulo: "Aparta con tiempo",
    descripcion: "Cada pago se reparte entre las semanas que tienes antes de su fecha límite.",
    icono: <IconoCalendario className="size-6" />,
  },
  {
    titulo: "Cuida tu semana",
    descripcion: "Sabes cuánto te queda sin descuidar tus compromisos, y qué semanas vienen cargadas.",
    icono: <IconoEscudo className="size-6" />,
  },
  {
    titulo: "Avanza hacia tu meta",
    descripcion: "Tu ahorro entra al plan desde el principio, en lugar de esperar a lo que sobre.",
    icono: <IconoTendencia className="size-6" />,
  },
];

/**
 * Semana ilustrativa de la tarjeta lateral. Son cifras de ejemplo, rotuladas así en
 * pantalla: la portada no tiene sesión y no conoce datos del usuario.
 */
const SEMANA_EJEMPLO = {
  disponible: "$1,200.00",
  apartar: "$850.00",
  queda: "$350.00",
  proporcionApartada: 850 / 1200,
  pagos: [
    { nombre: "Renta", monto: "$600.00" },
    { nombre: "Internet", monto: "$250.00" },
  ],
};

export default function Home() {
  return (
    <TransicionRuta>
      <div className="flex min-h-dvh flex-1 flex-col">
        <a href="#contenido" className="salto-contenido">
          Saltar al contenido
        </a>

        <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/"
            aria-label="Ahorrito, ir al inicio"
            className="inline-flex min-h-11 items-center rounded-xl px-1"
          >
            <Image
              src="/ahorrito-logo.svg"
              alt="Ahorrito"
              width={160}
              height={47}
              priority
              className="h-auto w-32 sm:w-36 dark:brightness-[2.6]"
            />
          </Link>

          <nav aria-label="Acceso a la cuenta" className="flex items-center gap-2">
            <Link
              href="/iniciar-sesion"
              className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-texto underline-offset-4 hover:underline"
            >
              Iniciar sesión
            </Link>
            <Link href="/registro" className="boton-invertido hidden text-sm sm:inline-flex">
              Crear cuenta
            </Link>
            <AnimatedThemeToggler />
          </nav>
        </header>

        <main id="contenido" className="mx-auto w-full max-w-6xl flex-1 px-4 pt-4 pb-10 sm:px-6 sm:pt-8">
          <div className="bento">
            <section
              aria-labelledby="titulo-portada"
              className="tarjeta flex flex-col justify-between gap-10 p-6 sm:p-10 md:col-span-4"
            >
              <div>
                <p className="chip chip-neutro">
                  <span aria-hidden="true" className="size-2 rounded-full bg-primario" />
                  <AnimatedShinyText unaVez>Tu plan semanal de dinero</AnimatedShinyText>
                </p>
                <h1
                  id="titulo-portada"
                  className="mt-6 max-w-2xl text-4xl leading-[1.05] font-extrabold tracking-tight text-texto sm:text-5xl lg:text-6xl"
                >
                  Llega a cada pago con dinero apartado.
                </h1>
                <p className="mt-5 max-w-xl text-lg leading-8 text-texto-suave">
                  Convierte tu presupuesto, tus fechas límite y tu meta de ahorro en un plan claro
                  para cada semana.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <InteractiveHoverLink href="/registro" className="w-full sm:w-auto">
                  Crear mi plan
                </InteractiveHoverLink>
                <Link href="/iniciar-sesion" className="boton-secundario w-full sm:w-auto">
                  Ya tengo una cuenta
                </Link>
              </div>
            </section>

            <section
              aria-labelledby="titulo-ejemplo"
              className="tarjeta-invertida flex flex-col gap-6 p-6 sm:p-8 md:col-span-2"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 id="titulo-ejemplo" className="text-sm font-semibold opacity-80">
                  Así se ve una semana
                </h2>
                <span className="chip bg-primario text-[#09090b]">Ejemplo</span>
              </div>

              <div>
                <p className="text-sm opacity-80">Te queda esta semana</p>
                <p className="mt-1 text-4xl font-extrabold tracking-tight tabular-nums">
                  {SEMANA_EJEMPLO.queda}
                </p>
                <div
                  aria-hidden="true"
                  className="mt-4 h-2 overflow-hidden rounded-full bg-current/15"
                >
                  <div
                    className="h-full rounded-full bg-primario"
                    style={{ width: `${SEMANA_EJEMPLO.proporcionApartada * 100}%` }}
                  />
                </div>
                <p className="mt-2 text-sm opacity-80">
                  Apartas {SEMANA_EJEMPLO.apartar} de {SEMANA_EJEMPLO.disponible}
                </p>
              </div>

              <ul className="mt-auto space-y-2 text-sm">
                {SEMANA_EJEMPLO.pagos.map((pago) => (
                  <li
                    key={pago.nombre}
                    className="flex items-center justify-between rounded-xl bg-current/10 px-3 py-2.5"
                  >
                    <span>{pago.nombre}</span>
                    <span className="font-bold tabular-nums">{pago.monto}</span>
                  </li>
                ))}
              </ul>
            </section>

            {beneficios.map((beneficio, indice) => (
              <section
                key={beneficio.titulo}
                aria-labelledby={`beneficio-${indice}`}
                className="tarjeta tarjeta-interactiva flex flex-col gap-5 p-6 md:col-span-2"
              >
                <span className="icono-tarjeta">{beneficio.icono}</span>
                <div>
                  <h2 id={`beneficio-${indice}`} className="text-lg font-bold text-texto">
                    {beneficio.titulo}
                  </h2>
                  <p className="mt-2 leading-7 text-texto-suave">{beneficio.descripcion}</p>
                </div>
              </section>
            ))}

            <footer className="elevado flex items-start gap-3 p-5 text-sm leading-6 text-texto-suave md:col-span-6 md:items-center">
              <IconoInfo className="size-5 shrink-0 text-texto" />
              <p>Ahorrito organiza tu información; no sustituye asesoría financiera profesional.</p>
            </footer>
          </div>
        </main>
      </div>
    </TransicionRuta>
  );
}
