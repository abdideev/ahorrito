/**
 * POST /api/planes (I-01, modificado por SC-05).
 *
 * Adapta HTTP al orquestador: verifica la sesión, valida el cuerpo, construye las
 * dependencias de la petición y traduce el resultado a códigos de estado. La secuencia
 * vive en orquestador.ts.
 *
 * Respuestas:
 * - 200 application/x-ndjson: línea `plan` en cuanto se guarda; línea `explicacion`
 *   después, salvo que se envíe `{"explicar": false}`.
 * - 400 cuerpo inválido · 401 sin sesión · 422 faltan datos obligatorios
 * - 503 la base de datos no respondió (sección 3.7.2: sin base de datos no hay plan)
 */

import { crearServicioGeminiDesdeEntorno } from "@/adapters/ia/gemini";
import { ErrorPersistencia, crearRepositorioSupabase } from "@/adapters/persistencia/repositorio-supabase";
import { fechaIso } from "@/core/calendario";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { fechaDeHoyEnMexico, generarPlan, validarCuerpo } from "./orquestador";

/**
 * Límite de la función: 20 s del adaptador de IA más el cálculo y la persistencia, con
 * holgura. Coincide con el umbral de 30 s de RNF-01.
 */
export const maxDuration = 30;

export async function POST(solicitud: Request): Promise<Response> {
  const cuerpo = validarCuerpo(await solicitud.text());
  if (!cuerpo.valido) {
    return Response.json(
      { error: 'El cuerpo debe estar vacio o ser {"explicar": true | false}.' },
      { status: 400 },
    );
  }

  const supabase = await crearClienteServidor();
  // proxy.ts ya rechaza las peticiones sin sesión; se verifica de nuevo porque el
  // Route Handler no debe depender de que el proxy esté configurado.
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const resultado = await generarPlan(
      {
        repositorio: crearRepositorioSupabase(supabase),
        explicacion: crearServicioGeminiDesdeEntorno(),
        registrarFallo: (mensaje, error) => console.error(`[planes] ${mensaje}`, describirError(error)),
      },
      { fechaReferencia: fechaIso(fechaDeHoyEnMexico(new Date())), explicar: cuerpo.explicar },
    );

    if (resultado.estado === "sin-datos") {
      return Response.json(
        { error: "Registra tu presupuesto y al menos un compromiso para generar el plan." },
        { status: 422 },
      );
    }

    return new Response(resultado.flujo, {
      status: 200,
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-store",
        // Evita que un proxy intermedio acumule el flujo y retrase la primera línea.
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("[planes] No se pudo generar el plan.", describirError(error));
    if (error instanceof ErrorPersistencia) {
      return Response.json({ error: "No se pudo acceder a tus datos. Intenta de nuevo." }, { status: 503 });
    }
    return Response.json({ error: "No se pudo generar el plan." }, { status: 500 });
  }
}

/** Solo el nombre y el código: el mensaje original podría contener datos de la consulta. */
function describirError(error: unknown): string {
  if (error instanceof ErrorPersistencia) {
    return `ErrorPersistencia(${error.codigo ?? "sin codigo"})`;
  }
  return error instanceof Error ? error.name : "desconocido";
}
