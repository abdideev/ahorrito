"use client";

import { useActionState, useState } from "react";
import { ESTADO_CAPTURA_INICIAL, type EstadoCaptura } from "@/lib/captura/estado";

interface Props {
  accion: (estado: EstadoCaptura, formulario: FormData) => Promise<EstadoCaptura>;
  id: string;
  /** Lo que se elimina, para que el botón lo diga y no solo "Eliminar". */
  descripcion: string;
}

/**
 * Baja de un elemento capturado, en dos pasos (RF-04).
 *
 * El primer clic pide confirmación y el segundo elimina. Se prefiere esto a
 * `window.confirm`, que no se puede estilar, no anuncia bien su contenido en algunos
 * lectores de pantalla y bloquea el hilo del navegador. El botón conserva el foco
 * entre ambos pasos, así que la secuencia también funciona solo con teclado (RNF-11).
 */
export function BotonEliminar({ accion, id, descripcion }: Props) {
  const [estado, enviar, pendiente] = useActionState(accion, ESTADO_CAPTURA_INICIAL);
  const [confirmando, setConfirmando] = useState(false);

  return (
    <form action={enviar} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={id} />
      {confirmando ? (
        <>
          <button
            type="submit"
            disabled={pendiente}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-error bg-transparent px-4 py-2 text-sm font-bold text-error disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pendiente ? "Eliminando…" : "Confirmar"}
          </button>
          <button
            type="button"
            onClick={() => setConfirmando(false)}
            className="boton-secundario px-4 py-2 text-sm"
          >
            Cancelar
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmando(true)}
          className="boton-secundario px-4 py-2 text-sm"
        >
          Eliminar<span className="sr-only"> {descripcion}</span>
        </button>
      )}
      {estado.tipo === "error" && estado.mensaje && (
        <p role="alert" className="text-sm font-semibold text-error">
          {estado.mensaje}
        </p>
      )}
    </form>
  );
}
