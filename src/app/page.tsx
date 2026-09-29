import Image from "next/image";
import Link from "next/link";

const beneficios = [
  {
    titulo: "Aparta con tiempo",
    descripcion: "Distribuye cada pago entre las semanas disponibles.",
    icono: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6" fill="none">
        <path
          d="M6 3v3m12-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    titulo: "Cuida tu semana",
    descripcion: "Conoce cuánto puedes usar sin descuidar tus compromisos.",
    icono: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6" fill="none">
        <path
          d="M12 21s8-4 8-10V5l-8-3-8 3v6c0 6 8 10 8 10Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="m9 12 2 2 4-5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    titulo: "Avanza hacia tu meta",
    descripcion: "Integra tu ahorro al plan en lugar de dejarlo para el final.",
    icono: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6" fill="none">
        <path
          d="M4 20V10m6 10V4m6 16v-7m4 7H2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-1 flex-col overflow-hidden">
      <a href="#contenido" className="salto-contenido">
        Saltar al contenido
      </a>

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-12">
        <Link
          href="/"
          aria-label="Ahorrito, ir al inicio"
          className="inline-flex min-h-11 items-center rounded-2xl px-2"
        >
          <Image
            src="/ahorrito-logo.svg"
            alt="Ahorrito"
            width={280}
            height={96}
            priority
            className="h-12 w-36 object-contain sm:h-14 sm:w-44"
          />
        </Link>

        <nav aria-label="Acceso a la cuenta" className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/iniciar-sesion"
            className="inline-flex min-h-11 items-center rounded-full px-3 font-bold text-verde-accesible underline-offset-4 hover:underline sm:px-4"
          >
            Iniciar sesión
          </Link>
          <Link href="/registro" className="boton-secundario hidden sm:inline-flex">
            Crear cuenta
          </Link>
        </nav>
      </header>

      <main id="contenido" className="relative z-0 flex flex-1 items-center py-12 sm:py-16 lg:py-20">
        <div
          aria-hidden="true"
          className="absolute -left-24 top-2 size-64 rounded-full border-[2.5rem] border-verde-marca/10 sm:size-80"
        />
        <div
          aria-hidden="true"
          className="absolute -right-20 bottom-0 size-60 rounded-full bg-verde-marca/10 blur-3xl sm:size-96"
        />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:px-12">
          <section aria-labelledby="titulo-portada" className="max-w-3xl">
            <p className="mb-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-verde-accesible/40 bg-verde-marca/15 px-4 py-2 text-sm font-extrabold tracking-wide text-verde-accesible uppercase">
              <span
                aria-hidden="true"
                className="size-2.5 rounded-full bg-verde-marca ring-4 ring-verde-marca/20"
              />
              Tu plan semanal de dinero
            </p>

            <h1
              id="titulo-portada"
              className="max-w-3xl text-4xl leading-[1.08] font-black tracking-[-0.04em] text-texto sm:text-6xl lg:text-7xl"
            >
              Llega a cada pago con dinero apartado.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 font-medium text-texto-suave sm:text-xl sm:leading-9">
              Convierte tu presupuesto, tus fechas límite y tu meta de ahorro en un plan claro para cada semana.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link href="/registro" className="boton-primario w-full sm:w-auto">
                Crear mi plan
                <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none">
                  <path
                    d="M5 12h14m-5-5 5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <Link href="/iniciar-sesion" className="boton-secundario w-full sm:w-auto">
                Ya tengo una cuenta
              </Link>
            </div>

            <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-texto-suave">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 shrink-0 text-verde-accesible" fill="none">
                <path
                  d="m5 12 4 4L19 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Sin fórmulas complicadas: tú das los datos y Ahorrito ordena las semanas.
            </p>
          </section>

          <section aria-labelledby="titulo-beneficios" className="superficie relative p-5 sm:p-7">
            <div className="hundido mb-7 flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="text-sm font-bold text-texto-suave">Tu próxima semana</p>
                <p className="mt-1 text-xl font-black text-texto">Todo bajo control</p>
              </div>
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-verde-marca/25 text-verde-accesible">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="size-7" fill="none">
                  <path
                    d="M7 10V8a5 5 0 0 1 10 0v2m-11 0h12a2 2 0 0 1 2 2v7H4v-7a2 2 0 0 1 2-2Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <path d="M12 14v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
            </div>

            <h2 id="titulo-beneficios" className="px-1 text-2xl font-black tracking-tight text-texto">
              Un paso claro cada semana
            </h2>
            <ul className="mt-5 space-y-4">
              {beneficios.map((beneficio) => (
                <li key={beneficio.titulo} className="elevado flex gap-4 p-4 sm:p-5">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-verde-marca/20 text-verde-accesible">
                    {beneficio.icono}
                  </span>
                  <div>
                    <h3 className="font-extrabold text-texto">{beneficio.titulo}</h3>
                    <p className="mt-1 text-sm leading-6 font-medium text-texto-suave">
                      {beneficio.descripcion}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>

      <footer className="relative z-10 mx-auto w-full max-w-7xl px-5 py-6 text-center text-sm font-medium text-texto-suave sm:px-8 lg:px-12">
        Ahorrito organiza tu información; no sustituye asesoría financiera profesional.
      </footer>
    </div>
  );
}
