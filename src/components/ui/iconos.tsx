/**
 * Iconos compartidos por la interfaz (C-01), sobre el conjunto Lucide de react-icons
 * (SC-08, #26).
 *
 * Este módulo es un adaptador: los componentes importan `IconoCalendario` y no
 * `LuCalendar`, así que cambiar de conjunto o de biblioteca es cambiar este archivo.
 * Todos son decorativos (`aria-hidden`): el significado siempre lo lleva el texto
 * contiguo, de modo que un lector de pantalla no anuncia nada que la vista no diga
 * (RNF-11).
 */

import type { IconBaseProps, IconType } from "react-icons";
import {
  LuArrowRight,
  LuBanknote,
  LuCalendar,
  LuCheck,
  LuChevronDown,
  LuCircleCheck,
  LuCircleX,
  LuClock,
  LuHistory,
  LuInfo,
  LuLayoutDashboard,
  LuLock,
  LuLogOut,
  LuMail,
  LuMoon,
  LuPencil,
  LuPiggyBank,
  LuPlus,
  LuReceipt,
  LuRepeat,
  LuShieldCheck,
  LuSparkles,
  LuSun,
  LuTrash2,
  LuTrendingUp,
  LuTriangleAlert,
  LuWallet,
} from "react-icons/lu";

type PropsIcono = Omit<IconBaseProps, "children">;

function adaptar(Icono: IconType, nombre: string) {
  function IconoAdaptado({ className = "size-5", ...props }: PropsIcono) {
    return <Icono aria-hidden="true" focusable="false" className={className} {...props} />;
  }
  IconoAdaptado.displayName = nombre;
  return IconoAdaptado;
}

export const IconoFlecha = adaptar(LuArrowRight, "IconoFlecha");
export const IconoCalendario = adaptar(LuCalendar, "IconoCalendario");
export const IconoEscudo = adaptar(LuShieldCheck, "IconoEscudo");
export const IconoTendencia = adaptar(LuTrendingUp, "IconoTendencia");
export const IconoCartera = adaptar(LuWallet, "IconoCartera");
export const IconoRecibo = adaptar(LuReceipt, "IconoRecibo");
export const IconoAlcancia = adaptar(LuPiggyBank, "IconoAlcancia");
export const IconoBillete = adaptar(LuBanknote, "IconoBillete");
export const IconoAviso = adaptar(LuTriangleAlert, "IconoAviso");
export const IconoInfo = adaptar(LuInfo, "IconoInfo");
export const IconoCheck = adaptar(LuCheck, "IconoCheck");
export const IconoCirculoCheck = adaptar(LuCircleCheck, "IconoCirculoCheck");
export const IconoError = adaptar(LuCircleX, "IconoError");
export const IconoMas = adaptar(LuPlus, "IconoMas");
export const IconoLapiz = adaptar(LuPencil, "IconoLapiz");
export const IconoPapelera = adaptar(LuTrash2, "IconoPapelera");
export const IconoDestello = adaptar(LuSparkles, "IconoDestello");
export const IconoHistorial = adaptar(LuHistory, "IconoHistorial");
export const IconoPanel = adaptar(LuLayoutDashboard, "IconoPanel");
export const IconoSalir = adaptar(LuLogOut, "IconoSalir");
export const IconoReloj = adaptar(LuClock, "IconoReloj");
export const IconoRepetir = adaptar(LuRepeat, "IconoRepetir");
export const IconoCandado = adaptar(LuLock, "IconoCandado");
export const IconoCorreo = adaptar(LuMail, "IconoCorreo");
export const IconoChevron = adaptar(LuChevronDown, "IconoChevron");
export const IconoSol = adaptar(LuSun, "IconoSol");
export const IconoLuna = adaptar(LuMoon, "IconoLuna");
