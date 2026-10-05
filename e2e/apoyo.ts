/**
 * Utilidades compartidas por las pruebas de extremo a extremo (SC-10, #33).
 *
 * Todo pasa por la interfaz, como lo haría una persona usuaria: no hay atajos a la base de datos.
 * La cuenta es la de prueba C, exclusiva de las pruebas automatizadas (#27); nunca la A, que es
 * la de la verificación manual.
 */
import { expect, test, type Page } from "@playwright/test";

const CORREO = process.env.PRUEBA_USUARIO_C_CORREO;
const CONTRASENA = process.env.PRUEBA_USUARIO_C_CONTRASENA;

export const HAY_CUENTA = Boolean(CORREO && CONTRASENA);

/** Omite la prueba si faltan las credenciales, y se detiene si C apunta a la cuenta A (#27). */
export function exigirCuenta(): void {
  test.skip(!HAY_CUENTA, "Requiere PRUEBA_USUARIO_C_* en .env.local");
  if (CORREO === process.env.PRUEBA_USUARIO_A_CORREO) {
    throw new Error("PRUEBA_USUARIO_C_CORREO no puede ser la cuenta del usuario A (incidencia #27)");
  }
}

/** Fecha AAAA-MM-DD a `dias` de hoy, para que la captura siga vigente cualquier día que se ejecute. */
export function fechaDentroDe(dias: number): string {
  const fecha = new Date(Date.now() + dias * 24 * 60 * 60 * 1000);
  return fecha.toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });
}

export async function iniciarSesion(page: Page): Promise<void> {
  await page.goto("/iniciar-sesion");
  await page.getByLabel("Correo electrónico").fill(CORREO as string);
  await page.getByLabel("Contraseña", { exact: true }).fill(CONTRASENA as string);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  // El primer inicio de sesión tras arrancar el servidor puede tardar varios segundos.
  await expect(page).toHaveURL(/\/panel$/, { timeout: 20_000 });
}

/** Elimina todos los pagos de la cuenta, uno por uno, con su confirmación. */
async function borrarPagos(page: Page): Promise<void> {
  const eliminar = page.getByRole("button", { name: /^Eliminar / });
  while ((await eliminar.count()) > 0) {
    const antes = await eliminar.count();
    await eliminar.first().click();
    await page.getByRole("button", { name: "Confirmar" }).click();
    await expect(eliminar).toHaveCount(antes - 1);
  }
}

export interface Pago {
  readonly nombre: string;
  readonly monto: string;
  readonly diasHastaVencer: number;
  readonly meses: string;
}

/**
 * Deja la captura en un estado conocido: presupuesto semanal y los pagos indicados. Empieza por
 * borrar los pagos previos, para que el resultado no dependa de ejecuciones anteriores.
 */
export async function prepararCaptura(page: Page, presupuesto: string, pagos: readonly Pago[]): Promise<void> {
  await borrarPagos(page);
  // Sin pagos, el panel cambia de estado (los formularios se abren solos). Se recarga para partir
  // del HTML del servidor y no de una transición a medias.
  await page.goto("/panel");

  const monto = page.getByLabel("¿Cuánto dinero recibes cada semana?");
  const editar = page.getByRole("button", { name: "Editar", exact: true });
  await expect(monto.or(editar).first()).toBeVisible();
  if (!(await monto.isVisible())) {
    await editar.click();
  }
  await monto.fill(presupuesto);
  await page.getByLabel("¿Qué día inicia tu semana?").selectOption("1");
  await page.getByRole("button", { name: "Guardar presupuesto" }).click();
  await expect(page.getByText("Presupuesto guardado.")).toBeVisible();

  for (const pago of pagos) {
    // Cada fila de la lista tiene su propio formulario de edición con las mismas etiquetas: el
    // de alta es el único que contiene el botón de envío "Agregar pago".
    const alta = page.locator("form").filter({ has: page.locator('button[type="submit"]', { hasText: "Agregar pago" }) });
    if (!(await alta.isVisible())) {
      await page.locator('button[type="button"]', { hasText: "Agregar pago" }).click();
    }
    await alta.getByLabel("¿Qué pago es?").fill(pago.nombre);
    await alta.getByLabel("Monto de cada pago").fill(pago.monto);
    await alta.getByLabel("Fecha límite").fill(fechaDentroDe(pago.diasHastaVencer));
    await alta.getByLabel("¿Cuántos meses?").selectOption(pago.meses);
    await alta.getByRole("button", { name: "Agregar pago" }).click();
    await expect(page.getByText(`Se agregó "${pago.nombre}".`)).toBeVisible();
  }
}

/** Perfil alto, como P1: cuatro pagos de tres meses. Produce un plan más alto que la ventana. */
export const PAGOS_P1: readonly Pago[] = [
  { nombre: "Renta", monto: "1800", diasHastaVencer: 33, meses: "3" },
  { nombre: "Transporte", monto: "600", diasHastaVencer: 12, meses: "3" },
  { nombre: "Servicio de internet", monto: "350", diasHastaVencer: 17, meses: "3" },
  { nombre: "Teléfono", monto: "250", diasHastaVencer: 25, meses: "3" },
];

/** Pulsa el botón principal del plan y espera a que el resultado esté en pantalla. */
export async function generarPlan(page: Page): Promise<void> {
  const boton = page.getByRole("button", { name: /Generar mi plan|Recalcular con mis datos/ });
  await boton.click();
  await expect(page.getByRole("note")).toBeVisible();
  await expect(boton).toBeEnabled();
}

/** Borra por la API todos los planes guardados de la cuenta. */
export async function borrarPlanes(page: Page): Promise<void> {
  const respuesta = await page.request.get("/api/planes");
  const { planes } = (await respuesta.json()) as { planes: { id: string }[] };
  for (const plan of planes) {
    await page.request.delete(`/api/planes/${plan.id}`);
  }
}
