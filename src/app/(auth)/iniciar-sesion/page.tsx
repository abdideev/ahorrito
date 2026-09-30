import type { Metadata } from "next";
import Link from "next/link";
import { FormularioCredenciales } from "@/components/autenticacion/formulario-credenciales";
import { TarjetaAcceso } from "@/components/autenticacion/tarjeta-acceso";
import { mensaje as claseMensaje } from "@/components/captura/estilos";
import { RUTA_PANEL, rutaInternaSegura } from "@/lib/autenticacion/rutas";
import { iniciarSesion } from "../acciones";

export const metadata: Metadata = {
  title: "Iniciar sesión · Ahorrito",
  description: "Accede a Ahorrito para organizar tus pagos y revisar tus planes guardados.",
};

interface Props {
  searchParams: Promise<{ siguiente?: string | string[]; error?: string | string[] }>;
}

export default async function PaginaInicioSesion({ searchParams }: Props) {
  const { siguiente, error } = await searchParams;
  const destino = rutaInternaSegura(Array.isArray(siguiente) ? siguiente[0] : siguiente, RUTA_PANEL);
  const falloConfirmacion = error === "confirmacion";

  return (
    <TarjetaAcceso
      pantalla="inicio-sesion"
      idTitulo="titulo-inicio-sesion"
      titulo="Iniciar sesión"
      descripcion="Retoma tu plan donde lo dejaste."
    >
      {falloConfirmacion && (
        <p role="alert" className={`${claseMensaje("error")} mt-5`}>
          No pudimos abrir tu sesión desde el enlace. Si lo abriste en otro navegador, tu correo pudo quedar confirmado: inicia sesión con tu contraseña. Si el enlace expiró, vuelve a registrarte.
        </p>
      )}

      <FormularioCredenciales
        accion={iniciarSesion}
        textoBoton="Iniciar sesión"
        autocompletarContrasena="current-password"
        siguiente={destino}
      />

      <p className="mt-6 border-t border-borde pt-5 text-center text-sm text-texto-suave">
        ¿No tienes cuenta?{" "}
        <Link
          href="/registro"
          className="inline-flex min-h-11 items-center font-bold text-texto underline decoration-2 underline-offset-4"
        >
          Crea una
        </Link>
      </p>
    </TarjetaAcceso>
  );
}
