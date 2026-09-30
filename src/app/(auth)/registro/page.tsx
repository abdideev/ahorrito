import type { Metadata } from "next";
import Link from "next/link";
import { FormularioCredenciales } from "@/components/autenticacion/formulario-credenciales";
import { TarjetaAcceso } from "@/components/autenticacion/tarjeta-acceso";
import { LONGITUD_MINIMA_CONTRASENA } from "@/lib/autenticacion/validacion";
import { registrarse } from "../acciones";

export const metadata: Metadata = {
  title: "Crear cuenta · Ahorrito",
  description: "Crea tu cuenta para guardar y consultar tus planes semanales de dinero.",
};

export default function PaginaRegistro() {
  return (
    <TarjetaAcceso
      pantalla="registro"
      idTitulo="titulo-registro"
      titulo="Crear cuenta"
      descripcion="Registra tu correo para guardar tus planes semanales."
    >
      <FormularioCredenciales
        accion={registrarse}
        textoBoton="Crear mi cuenta"
        autocompletarContrasena="new-password"
        ayudaContrasena={`Mínimo ${LONGITUD_MINIMA_CONTRASENA} caracteres.`}
      />

      <p className="mt-6 border-t border-borde pt-5 text-center text-sm text-texto-suave">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/iniciar-sesion"
          className="inline-flex min-h-11 items-center font-bold text-texto underline decoration-2 underline-offset-4"
        >
          Inicia sesión
        </Link>
      </p>
    </TarjetaAcceso>
  );
}
