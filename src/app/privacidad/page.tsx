import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { TransicionRuta } from "@/components/ui/transicion-ruta";
import { formatearFechaLarga } from "@/lib/fecha";
import { DIAS_ELIMINACION_TRAS_RETIRO, FECHA_AVISO, RESPONSABLE, VERSION_AVISO } from "@/lib/privacidad/aviso";

export const metadata: Metadata = {
  title: "Aviso de privacidad · Ahorrito",
  description: "Qué datos trata Ahorrito, para qué, con quién y cómo ejercer tus derechos ARCO.",
};

const DATOS: { dato: string; origen: string; guarda: string }[] = [
  { dato: "Correo electrónico", origen: "Lo escribes al registrarte", guarda: "En el servicio de autenticación" },
  {
    dato: "Contraseña",
    origen: "La escribes al registrarte",
    guarda: "Nunca en texto legible: solo su derivación con bcrypt. Nadie, ni el responsable, puede leerla",
  },
  { dato: "Presupuesto semanal y día de inicio de semana", origen: "Lo capturas en el panel", guarda: "En la base de datos, asociado a tu cuenta" },
  {
    dato: "Pagos con fecha límite: el nombre que les das, monto, fecha y repeticiones",
    origen: "Los capturas en el panel",
    guarda: "En la base de datos, asociados a tu cuenta",
  },
  { dato: "Ingresos extraordinarios: monto y fecha", origen: "Los capturas en el panel", guarda: "En la base de datos, asociados a tu cuenta" },
  { dato: "Meta de ahorro: monto y fecha objetivo", origen: "La capturas en el panel", guarda: "En la base de datos, asociada a tu cuenta" },
  {
    dato: "Planes generados: semanas, montos, advertencias y explicación",
    origen: "Los genera el sistema con tus datos",
    guarda: "En la base de datos, hasta que los elimines",
  },
];

const PROVEEDORES: { nombre: string; funcion: string; datos: string; ubicacion: string }[] = [
  { nombre: "Supabase", funcion: "Autenticación y base de datos", datos: "Todos los de la sección 2", ubicacion: "Estados Unidos" },
  { nombre: "Vercel", funcion: "Hospedaje de la aplicación", datos: "Tus peticiones a la aplicación, incluida tu dirección IP", ubicacion: "Estados Unidos" },
  {
    nombre: "Google (API de Gemini)",
    funcion: "Redacta la explicación del plan",
    datos: "Solo montos, fechas y etiquetas genéricas, sin datos que te identifiquen",
    ubicacion: "Estados Unidos",
  },
];

const enlace = "font-bold text-texto underline decoration-2 underline-offset-4";

function Seccion({ id, titulo, children }: { id: string; titulo: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="space-y-3">
      <h2 id={id} className="text-xl font-extrabold tracking-tight text-texto">
        {titulo}
      </h2>
      {children}
    </section>
  );
}

function Tabla({ titulo, columnas, filas }: { titulo: string; columnas: string[]; filas: string[][] }) {
  return (
    // En móvil la tabla se desplaza dentro de su contenedor; enfocable para que también se
    // pueda desplazar con el teclado (RNF-11).
    <div role="region" aria-label={titulo} tabIndex={0} className="overflow-x-auto rounded-2xl border border-borde">
      <table className="w-full min-w-[32rem] text-left text-sm leading-6">
        <caption className="sr-only">{titulo}</caption>
        <thead className="bg-superficie-hundida text-texto">
          <tr>
            {columnas.map((columna) => (
              <th key={columna} scope="col" className="px-4 py-2 font-semibold">
                {columna}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila) => (
            <tr key={fila[0]} className="border-t border-borde">
              {fila.map((celda, indice) =>
                indice === 0 ? (
                  <th key={indice} scope="row" className="px-4 py-2 font-semibold text-texto">
                    {celda}
                  </th>
                ) : (
                  <td key={indice} className="px-4 py-2 text-texto-suave">
                    {celda}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Aviso de privacidad integral (RF-15, SC-09 #32, restricción legal RES-08).
 *
 * Pública por diseño (`RUTA_PRIVACIDAD` en las rutas públicas): debe poder leerse antes de
 * crear una cuenta. Cada afirmación se cotejó con el código el 03/10/2026: las tablas de
 * `supabase/migrations`, la anonimización de `src/adapters/ia/carga.ts` y las cookies de
 * `src/lib/tema.ts` y `@supabase/ssr`. El texto lo aprobó el responsable; no es asesoría legal.
 */
export default function PaginaPrivacidad() {
  return (
    <TransicionRuta>
      <div className="flex min-h-dvh flex-1 flex-col">
        <a href="#contenido" className="salto-contenido">
          Saltar al contenido
        </a>

        <header className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" aria-label="Ahorrito, ir al inicio" className="inline-flex min-h-11 items-center rounded-xl px-1">
            <Image src="/ahorrito-logo.svg" alt="Ahorrito" width={160} height={47} className="h-auto w-32 sm:w-36 dark:brightness-[2.6]" />
          </Link>
          <AnimatedThemeToggler />
        </header>

        <main id="contenido" className="mx-auto w-full max-w-3xl flex-1 px-4 pb-12 sm:px-6">
          <article aria-labelledby="titulo-privacidad" className="tarjeta space-y-8 p-6 leading-7 text-texto-suave sm:p-10">
            <header className="space-y-2">
              <p className="rotulo">
                Versión {VERSION_AVISO} · Vigente desde el <time dateTime={FECHA_AVISO}>{formatearFechaLarga(FECHA_AVISO)}</time>
              </p>
              <h1 id="titulo-privacidad" className="text-3xl font-extrabold tracking-tight text-texto sm:text-4xl">
                Aviso de privacidad integral
              </h1>
            </header>

            <Seccion id="responsable" titulo="1. Responsable">
              <p>
                {RESPONSABLE.nombre}, desarrollador del proyecto académico <strong className="text-texto">Ahorrito</strong>,
                elaborado para la asignatura Administración de la Calidad del Software de la Universidad Autónoma del
                Estado de Hidalgo, Escuela Superior de Tlahuelilpan. Ahorrito es un proyecto académico, no una empresa ni
                un servicio financiero.
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <strong className="text-texto">Domicilio para oír y recibir notificaciones:</strong> {RESPONSABLE.domicilio}.
                </li>
                <li>
                  <strong className="text-texto">Contacto para temas de privacidad:</strong>{" "}
                  <a href={`mailto:${RESPONSABLE.correo}`} className={enlace}>
                    {RESPONSABLE.correo}
                  </a>
                </li>
              </ul>
            </Seccion>

            <Seccion id="datos" titulo="2. Datos personales que tratamos">
              <Tabla
                titulo="Datos personales que trata Ahorrito"
                columnas={["Dato", "De dónde viene", "Cómo se guarda"]}
                filas={DATOS.map((fila) => [fila.dato, fila.origen, fila.guarda])}
              />
              <p>
                Tus montos, pagos e ingresos son <strong className="text-texto">datos patrimoniales</strong>: por eso
                pedimos tu consentimiento expreso al registrarte. No tratamos datos personales sensibles.
              </p>
              <p>
                <strong className="text-texto">No pedimos</strong> tu nombre, teléfono, domicilio, número de cuenta, número
                de tarjeta ni el nombre de tu banco. Te recomendamos no escribirlos en el nombre de tus pagos: usa nombres
                genéricos como «Renta» o «Transporte».
              </p>
            </Seccion>

            <Seccion id="finalidades" titulo="3. Finalidades">
              <p>
                Todas son <strong className="text-texto">necesarias</strong> para el servicio que solicitas. No hay
                finalidades secundarias: no usamos tus datos para publicidad, perfiles comerciales ni estudios de mercado,
                y no los vendemos.
              </p>
              <ol className="list-decimal space-y-1 pl-5">
                <li>Crear tu cuenta y autenticarte, para que solo tú veas tu información.</li>
                <li>Calcular y guardar tu plan semanal a partir de lo que capturas, y mostrarte los planes que generaste antes.</li>
                <li>
                  Generar la explicación del plan con un servicio de inteligencia artificial. Antes de enviarla se{" "}
                  <strong className="text-texto">anonimiza</strong>: solo viajan montos, fechas y etiquetas genéricas
                  («Compromiso 1»). No viajan tu correo, el nombre de tus pagos ni ningún dato que te identifique.
                </li>
              </ol>
            </Seccion>

            <Seccion id="proveedores" titulo="4. Quién más participa en el tratamiento">
              <p>
                No transferimos tus datos a terceros para que los usen con fines propios. Para operar, la aplicación usa
                estos proveedores de infraestructura, que tratan los datos por cuenta del responsable:
              </p>
              <Tabla
                titulo="Proveedores de infraestructura"
                columnas={["Proveedor", "Qué hace", "Qué datos recibe", "Ubicación"]}
                filas={PROVEEDORES.map((fila) => [fila.nombre, fila.funcion, fila.datos, fila.ubicacion])}
              />
              <p>
                Las condiciones del plan gratuito de la API de Gemini pueden permitir a Google usar el contenido enviado
                para mejorar sus productos. Como solo se envían cifras anonimizadas, esto no expone datos que te
                identifiquen; lo declaramos por transparencia.
              </p>
            </Seccion>

            <Seccion id="derechos" titulo="5. Derechos ARCO y revocación del consentimiento">
              <p>
                Tienes derecho a <strong className="text-texto">acceder</strong> a tus datos,{" "}
                <strong className="text-texto">rectificarlos</strong>, <strong className="text-texto">cancelarlos</strong>{" "}
                u <strong className="text-texto">oponerte</strong> a su tratamiento (derechos ARCO), y a{" "}
                <strong className="text-texto">revocar</strong> el consentimiento que diste.
              </p>
              <p>
                <strong className="text-texto">Dentro de la aplicación, en cualquier momento y sin trámite,</strong> puedes
                consultar, modificar y eliminar tu presupuesto, tus pagos, tus ingresos extra, tu meta y tus planes
                guardados.
              </p>
              <p>
                <strong className="text-texto">Por solicitud, para todo lo demás</strong>, incluida la cancelación de tu
                cuenta, escribe a{" "}
                <a href={`mailto:${RESPONSABLE.correo}`} className={enlace}>
                  {RESPONSABLE.correo}
                </a>{" "}
                desde el correo con el que te registraste. Indica el derecho que quieres ejercer, describe los datos y,
                para rectificar, el dato correcto. Te respondemos en un máximo de 20 días hábiles y, si procede, la
                solicitud se hace efectiva dentro de los 15 días hábiles siguientes.
              </p>
              <p>
                Revocar el consentimiento se pide por el mismo medio. Como todas las finalidades son necesarias, revocarlo
                implica cancelar tu cuenta y eliminar tus datos. Si consideras que tu derecho a la protección de datos fue
                vulnerado, puedes acudir a la autoridad competente en la materia.
              </p>
            </Seccion>

            <Seccion id="conservacion" titulo="6. Cuánto tiempo conservamos tus datos">
              <ul className="list-disc space-y-1 pl-5">
                <li>Mientras tu cuenta exista.</li>
                <li>Tus planes guardados permanecen hasta que los elimines desde el historial.</li>
                <li>Al cancelar tu cuenta se eliminan tu cuenta y todos tus datos, dentro del plazo de la sección 5.</li>
                <li>
                  Ahorrito es un proyecto académico con una duración definida. Al retirar el servicio, todos los datos se
                  eliminan a más tardar {DIAS_ELIMINACION_TRAS_RETIRO} días naturales después del retiro.
                </li>
              </ul>
            </Seccion>

            <Seccion id="cookies" titulo="7. Cookies">
              <p>
                Usamos solo dos cookies, necesarias o de preferencia, y{" "}
                <strong className="text-texto">ninguna de rastreo, publicidad ni analítica</strong>:
              </p>
              <Tabla
                titulo="Cookies que usa Ahorrito"
                columnas={["Cookie", "Para qué", "Duración"]}
                filas={[
                  ["Sesión (sb-…)", "Mantenerte con la sesión iniciada", "Mientras dure la sesión"],
                  ["theme", "Recordar si elegiste el tema claro u oscuro", "Un año"],
                ]}
              />
            </Seccion>

            <Seccion id="seguridad" titulo="8. Seguridad">
              <p>
                El tráfico viaja cifrado (HTTPS), las contraseñas se guardan derivadas con bcrypt y cada usuario solo puede
                leer sus propios registros, por una regla aplicada en la propia base de datos.
              </p>
            </Seccion>

            <Seccion id="cambios" titulo="9. Cambios a este aviso">
              <p>
                Cualquier cambio se publica en esta misma página, con una versión y una fecha nuevas. Si el cambio agrega
                una finalidad o un tipo de dato, te pediremos de nuevo tu consentimiento antes de seguir tratando tus datos.
              </p>
            </Seccion>

            <p className="border-t border-borde pt-6">
              <Link href="/" className={`inline-flex min-h-11 items-center ${enlace}`}>
                Volver al inicio
              </Link>
            </p>
          </article>
        </main>
      </div>
    </TransicionRuta>
  );
}
