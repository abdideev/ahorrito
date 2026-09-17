import type { NextRequest } from "next/server";
import { actualizarSesion } from "@/lib/supabase/sesion";

/**
 * Proxy de Next.js 16 (antes llamado middleware). Renueva la sesión de Supabase y
 * protege las rutas en cada petición. La lógica vive en src/lib/supabase/sesion.ts.
 */
export async function proxy(solicitud: NextRequest) {
  return actualizarSesion(solicitud);
}

export const config = {
  matcher: [
    // Todas las rutas excepto archivos estáticos, optimización de imágenes e iconos.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
