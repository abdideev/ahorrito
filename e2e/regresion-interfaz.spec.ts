/**
 * Regresión de los defectos de interfaz corregidos en las Fases 4 y 5 (SC-10, #33). Plan de
 * pruebas, sección 9.4. Hasta esta solicitud de cambio, solo los protegía una prueba manual.
 */
import { expect, test, type Page } from "@playwright/test";
import { borrarPlanes, exigirCuenta, generarPlan, iniciarSesion, PAGOS_P1, prepararCaptura } from "./apoyo";

/** Posición del descargo respecto a la ventana, en el estado en que la aplicación deja la página. */
async function posicionDelDescargo(page: Page) {
  return page.getByRole("note").evaluate((nota) => {
    const r = nota.getBoundingClientRect();
    return { arriba: r.top, abajo: r.bottom, alto: window.innerHeight };
  });
}

test.describe("E2E-01 · CA-07: el descargo queda visible sin desplazar al generar el plan", () => {
  test.beforeEach(async ({ page }) => {
    exigirCuenta();
    await iniciarSesion(page);
    await prepararCaptura(page, "700", PAGOS_P1);
  });

  test.afterEach(async ({ page }) => {
    if (test.info().status !== "skipped") {
      await borrarPlanes(page);
    }
  });

  for (const ventana of [
    { nombre: "escritorio 1280 × 800", width: 1280, height: 800 },
    { nombre: "móvil 375 × 812", width: 375, height: 812 },
  ]) {
    test(ventana.nombre, async ({ page }) => {
      await page.setViewportSize({ width: ventana.width, height: ventana.height });
      await page.goto("/panel");
      await generarPlan(page);

      // Defectos protegidos: el descargo quedó 956 px por debajo del borde (Fase 4) y, con el
      // rediseño, 480 px por encima (Fase 5). Se espera a que termine el desplazamiento del foco.
      await expect
        .poll(async () => {
          const { arriba, abajo, alto } = await posicionDelDescargo(page);
          return arriba >= 0 && abajo <= alto;
        })
        .toBe(true);
    });
  }
});

test.describe("E2E-02 · capas de CSS: las utilidades responsivas de Tailwind se respetan", () => {
  // Defecto protegido: clases propias fuera de @layer anulaban `hidden sm:inline-flex` y el botón
  // "Crear cuenta" de la cabecera aparecía en móvil.
  test("en móvil el botón de la cabecera está oculto y en escritorio visible", async ({ page }) => {
    const boton = page.locator("header").getByRole("link", { name: "Crear cuenta", exact: true });

    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(boton).toBeHidden();

    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(boton).toBeVisible();
  });
});

test.describe("E2E-03 · las tarjetas se ven sin JavaScript", () => {
  // Defecto protegido: la entrada de las tarjetas con Motion se servía con `opacity: 0` desde el
  // servidor y el panel quedaba en blanco hasta hidratar. `toBeVisible` no basta, porque
  // Playwright considera visible un elemento con opacidad 0: se lee la opacidad calculada.
  async function opacidadesDeTarjetas(page: Page) {
    // La entrada es una animación de CSS de 350 ms con retraso escalonado: se deja terminar.
    await page.waitForTimeout(1_000);
    return page.locator(".aparecer").evaluateAll((tarjetas) =>
      tarjetas.map((t) => Number(getComputedStyle(t).opacity)),
    );
  }

  test("portada", async ({ browser }) => {
    const contexto = await browser.newContext({ javaScriptEnabled: false });
    const page = await contexto.newPage();
    await page.goto("/");
    const opacidades = await opacidadesDeTarjetas(page);
    expect(opacidades.length).toBeGreaterThan(0);
    expect(opacidades.every((o) => o === 1)).toBe(true);
    await contexto.close();
  });

  test("panel con sesión", async ({ browser, page }) => {
    exigirCuenta();
    // La sesión se abre con JavaScript y se copia a un contexto sin él.
    await iniciarSesion(page);
    const contexto = await browser.newContext({
      javaScriptEnabled: false,
      storageState: await page.context().storageState(),
    });
    const sinJs = await contexto.newPage();
    await sinJs.goto("/panel");
    await expect(sinJs).toHaveURL(/\/panel$/);
    const opacidades = await opacidadesDeTarjetas(sinJs);
    expect(opacidades.length).toBeGreaterThan(0);
    expect(opacidades.every((o) => o === 1)).toBe(true);
    await contexto.close();
  });
});
