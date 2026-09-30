import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { cookies } from "next/headers";
import { COOKIE_TEMA } from "@/lib/tema";
import "./globals.css";

// Fuente variable autoalojada por next/font: el navegador no hace solicitudes a Google.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ahorrito",
  description: "Plan semanal de asignación de dinero para estudiantes",
};

/**
 * El tema elegido viaja en una cookie para que el servidor entregue el HTML ya con la
 * clase `dark` y no haya destello del tema contrario. Se descartó un script en línea:
 * React lo rechaza al hidratar, y `next/script` con `beforeInteractive` lo difiere
 * hasta después del primer pintado. Sin cookie queda el claro, el predeterminado.
 */
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const oscuro = (await cookies()).get(COOKIE_TEMA)?.value === "dark";

  return (
    <html lang="es" className={`${jakarta.variable} h-full antialiased${oscuro ? " dark" : ""}`}>
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        {children}
      </body>
    </html>
  );
}
