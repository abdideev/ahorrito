/**
 * DELETE /api/planes/{id} (I-01, SC-07).
 *
 * Se simulan la sesión y el repositorio: lo que se verifica aquí es el contrato HTTP de
 * la ruta. Que la seguridad por fila impida borrar un plan ajeno lo prueba
 * `aislamiento.integracion.test.ts` contra la base de datos real (CA-10).
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

const eliminarPlan = vi.fn<(id: string) => Promise<boolean>>();
const getClaims = vi.fn();

vi.mock("@/lib/supabase/servidor", () => ({
  crearClienteServidor: async () => ({ auth: { getClaims } }),
}));

vi.mock("@/adapters/persistencia/repositorio-supabase", async (importarOriginal) => {
  const original = await importarOriginal<typeof import("@/adapters/persistencia/repositorio-supabase")>();
  return { ...original, crearRepositorioSupabase: () => ({ eliminarPlan }) };
});

const { DELETE } = await import("./route");
const { ErrorPersistencia } = await import("@/adapters/persistencia/repositorio-supabase");

const ID = "3f2b8c1e-9a4d-4e7b-b1c2-5d6e7f8a9b0c";
const solicitar = () =>
  DELETE(new Request(`http://localhost/api/planes/${ID}`, { method: "DELETE" }), {
    params: Promise.resolve({ id: ID }),
  });

describe("DELETE /api/planes/{id}", () => {
  beforeEach(() => {
    eliminarPlan.mockReset();
    getClaims.mockReset();
    getClaims.mockResolvedValue({ data: { claims: { sub: "usuario" } } });
  });

  it("responde 204 sin cuerpo cuando el plan propio se elimina", async () => {
    eliminarPlan.mockResolvedValue(true);

    const respuesta = await solicitar();

    expect(respuesta.status).toBe(204);
    expect(await respuesta.text()).toBe("");
    expect(eliminarPlan).toHaveBeenCalledWith(ID);
  });

  it("responde 404 si el plan no existe o es de otro usuario, sin distinguir los casos", async () => {
    eliminarPlan.mockResolvedValue(false);

    const respuesta = await solicitar();

    expect(respuesta.status).toBe(404);
    expect(await respuesta.json()).toEqual({ error: "No encontramos ese plan." });
  });

  it("responde 401 sin sesión y no toca el repositorio", async () => {
    getClaims.mockResolvedValue({ data: null });

    const respuesta = await solicitar();

    expect(respuesta.status).toBe(401);
    expect(eliminarPlan).not.toHaveBeenCalled();
  });

  it("responde 503 si la base de datos falla, sin exponer el detalle", async () => {
    eliminarPlan.mockRejectedValue(new ErrorPersistencia("No se pudo eliminar el plan.", "08006"));
    const registro = vi.spyOn(console, "error").mockImplementation(() => {});

    const respuesta = await solicitar();

    expect(respuesta.status).toBe(503);
    expect(JSON.stringify(await respuesta.json())).not.toContain("08006");
    expect(registro).toHaveBeenCalledWith(expect.stringContaining("ErrorPersistencia(08006)"));
    registro.mockRestore();
  });
});
