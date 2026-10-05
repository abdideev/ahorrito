/**
 * GET y DELETE /api/planes/{id} (I-01, RF-12).
 *
 * GET devuelve un plan guardado con sus asignaciones y su explicación, que puede ser
 * nula (RNF-03). DELETE lo elimina con sus semanas (SC-07) y responde 204 sin cuerpo.
 *
 * En ambos, un plan inexistente y uno de otro usuario producen la **misma** respuesta
 * 404: distinguirlos revelaría qué identificadores existen (amenaza AM-01).
 */

import { ErrorPersistencia, crearRepositorioSupabase } from "@/adapters/persistencia/repositorio-supabase";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export async function GET(
  _solicitud: Request,
  contexto: { params: Promise<{ id: string }> },
): Promise<Response> {
  const supabase = await crearClienteServidor();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await contexto.params;
  try {
    const guardado = await crearRepositorioSupabase(supabase).obtenerPlan(id);
    if (guardado === null) {
      return Response.json({ error: "No encontramos ese plan." }, { status: 404 });
    }
    return Response.json(guardado, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const codigo = error instanceof ErrorPersistencia ? error.codigo : undefined;
    console.error(`[planes] No se pudo consultar el plan. ErrorPersistencia(${codigo ?? "sin codigo"})`);
    return Response.json({ error: "No se pudo acceder a tus datos. Intenta de nuevo." }, { status: 503 });
  }
}

export async function DELETE(
  _solicitud: Request,
  contexto: { params: Promise<{ id: string }> },
): Promise<Response> {
  const supabase = await crearClienteServidor();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await contexto.params;
  try {
    const eliminado = await crearRepositorioSupabase(supabase).eliminarPlan(id);
    if (!eliminado) {
      return Response.json({ error: "No encontramos ese plan." }, { status: 404 });
    }
    return new Response(null, { status: 204 });
  } catch (error) {
    const codigo = error instanceof ErrorPersistencia ? error.codigo : undefined;
    console.error(`[planes] No se pudo eliminar el plan. ErrorPersistencia(${codigo ?? "sin codigo"})`);
    return Response.json({ error: "No se pudo acceder a tus datos. Intenta de nuevo." }, { status: 503 });
  }
}
