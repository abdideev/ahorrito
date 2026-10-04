import type { Metadata } from "next";
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
      descripcion="Guarda y consulta tus planes semanales."
      enlaceAviso={false}
    >
      <FormularioCredenciales
        accion={registrarse}
        textoBoton="Crear mi cuenta"
        autocompletarContrasena="new-password"
        ayudaContrasena={`Mínimo ${LONGITUD_MINIMA_CONTRASENA} caracteres.`}
        pedirConsentimiento
      />
    </TarjetaAcceso>
  );
}
