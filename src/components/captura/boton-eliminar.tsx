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
    <form action={enviar} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      {confirmando ? (
        <>
          <button
            type="submit"
            disabled={pendiente}
            className="rounded border border-red-600 px-3 py-1.5 text-sm font-medium text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:opacity-60 dark:text-red-400"
          >
            {pendiente ? "Eliminando…" : "Confirmar"}
          </button>
          <button
            type="button"
            onClick={() => setConfirmando(false)}
            className="rounded px-3 py-1.5 text-sm underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
          >
            Cancelar
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmando(true)}
          className="rounded border border-zinc-400 px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 dark:border-zinc-600"
        >
          Eliminar<span className="sr-only"> {descripcion}</span>
        </button>
      )}
      {estado.tipo === "error" && estado.mensaje && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {estado.mensaje}
        </p>
      )}
    </form>
  );
}
