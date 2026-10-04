/**
 * E2E-04 · Prueba de humo (SC-10, #33). Recorre el camino principal de la persona usuaria de
 * principio a fin en la compilación de producción: entrar, capturar, generar, consultar y borrar
 * el plan, y abrir el aviso de privacidad desde la sesión. No sustituye a CA-23, que se mide en
 * los navegadores reales.
 */
import { expect, test } from "@playwright/test";
import { borrarPlanes, exigirCuenta, generarPlan, iniciarSesion, prepararCaptura } from "./apoyo";

test("E2E-04 · entrar, capturar, generar, consultar, borrar y abrir el aviso", async ({ page }) => {
  exigirCuenta();
  await page.setViewportSize({ width: 1280, height: 800 });

  await iniciarSesion(page);
  await borrarPlanes(page);
  await prepararCaptura(page, "500", [{ nombre: "Colegiatura", monto: "600", diasHastaVencer: 20, meses: "1" }]);

  // Plan: descargo, tabla de semanas y el pago capturado en ella.
  await generarPlan(page);
  await expect(page.getByRole("table").first()).toContainText("Colegiatura");

  // Historial: el plan recién generado aparece y su detalle se abre en escritorio.
  await page.getByRole("link", { name: "Planes guardados" }).click();
  await expect(page).toHaveURL(/\/planes$/);
  await expect(page.locator("#titulo-detalle")).toContainText("Plan generado el");

  // Borrado en dos pasos.
  await page.getByRole("button", { name: /^Eliminar el plan del/ }).first().click();
  await expect(page.getByText("¿Eliminar este plan? No se puede deshacer.")).toBeVisible();
  await page.getByRole("button", { name: "Eliminar", exact: true }).click();
  // Era el único plan (#34): la confirmación se anuncia y el foco pasa a la pantalla vacía.
  await expect(page.getByRole("status").filter({ hasText: "Plan eliminado." })).toHaveCount(1);
  await expect(page.getByRole("link", { name: "Ir al panel", exact: true })).toBeFocused();

  // Aviso de privacidad desde la barra, con sesión: el regreso lleva al panel.
  await page.getByRole("link", { name: "Aviso de privacidad" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Aviso de privacidad integral");
  await expect(page.getByRole("link", { name: "Volver al panel" })).toBeVisible();

  await borrarPlanes(page);
});
