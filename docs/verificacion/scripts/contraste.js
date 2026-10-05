/**
 * Medición de contraste de texto para CA-12 (RNF-11). Plan de pruebas, caso CP-12.
 *
 * Recorre todos los nodos de texto visibles de la página, calcula el color de fondo efectivo
 * (componiendo las capas semitransparentes hasta un fondo opaco) y la razón de contraste WCAG
 * 2.x del texto contra ese fondo, incluida la opacidad heredada. Umbral: 4.5:1 para texto
 * normal y 3:1 para texto grande (24 px, o 18.66 px en negrita).
 *
 * Texto con degradado (color transparente y `background-clip: text`, como el texto brillante
 * de Magic UI): se toman todos los colores del degradado y se informa el peor. axe-core no
 * puede evaluarlo y lo deja como "incompleto"; este script lo cubre.
 *
 * Uso: pegar en la consola o ejecutarlo con la herramienta del navegador, en cada pantalla y
 * en cada tema. Devuelve un objeto que se copia tal cual al registro.
 *
 * Límite conocido: no ve imágenes de fondo ni texto sobre fotografías (la aplicación no tiene).
 * Versionado el 03/10/2026; la versión anterior, sin la rama del degradado, se usó el 29 y el
 * 30/09/2026.
 */
(() => {
  const lienzo = document.createElement("canvas");
  lienzo.width = lienzo.height = 1;
  const ctx = lienzo.getContext("2d", { willReadFrequently: true });

  // Convierte cualquier color CSS (incluidos oklch y color-mix ya resueltos) a [r, g, b, a].
  const aRgba = (color) => {
    if (color === "transparent" || color === "rgba(0, 0, 0, 0)") return [0, 0, 0, 0];
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = "#000";
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    const m = color.match(/\/\s*([\d.]+%?)\)|rgba\([^)]*,\s*([\d.]+)\)/);
    let a = 1;
    if (m) {
      const v = m[1] ?? m[2];
      a = v.endsWith("%") ? parseFloat(v) / 100 : parseFloat(v);
    }
    return [d[0], d[1], d[2], a];
  };
  const luminancia = ([r, g, b]) => {
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const razon = (a, b) => {
    const x = luminancia(a);
    const y = luminancia(b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  };
  const mezclar = (arriba, abajo) => [0, 1, 2].map((i) => Math.round(arriba[i] * arriba[3] + abajo[i] * (1 - arriba[3])));

  const fondoDe = (el) => {
    const capas = [];
    for (let n = el; n; n = n.parentElement) {
      const c = aRgba(getComputedStyle(n).backgroundColor);
      if (c[3] > 0) {
        capas.push(c);
        if (c[3] >= 1) break;
      }
    }
    let base = [255, 255, 255];
    const raiz = aRgba(getComputedStyle(document.documentElement).backgroundColor);
    if (raiz[3] > 0) base = raiz.slice(0, 3);
    for (let i = capas.length - 1; i >= 0; i--) base = mezclar(capas[i], base);
    return base;
  };

  const resultados = [];
  const recorrido = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (recorrido.nextNode()) {
    const nodo = recorrido.currentNode;
    if (!nodo.textContent.trim()) continue;
    const el = nodo.parentElement;
    const cs = getComputedStyle(el);
    const oculto =
      cs.visibility === "hidden" ||
      cs.display === "none" ||
      el.closest("[aria-hidden=true]") ||
      el.closest(".sr-only") ||
      (el.offsetParent === null && cs.position !== "fixed");
    if (oculto) continue;

    let opacidad = 1;
    for (let n = el; n; n = n.parentElement) opacidad *= parseFloat(getComputedStyle(n).opacity);

    const grande = parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.66 && Number(cs.fontWeight) >= 700);
    const texto = nodo.textContent.trim().slice(0, 40);

    // Texto con degradado: el color visible sale del fondo recortado al texto.
    const conDegradado = el.closest(".texto-brillante-animado");
    if (cs.color === "rgba(0, 0, 0, 0)" || conDegradado) {
      const origen = conDegradado ?? el;
      const colores = getComputedStyle(origen).backgroundImage.match(/rgba?\([^)]*\)|oklch\([^)]*\)|#[0-9a-f]{3,8}/gi) ?? [];
      if (colores.length === 0) continue;
      const fondo = fondoDe(origen.parentElement ?? origen);
      const peor = Math.min(
        ...colores.map((c) => {
          const t = aRgba(c);
          return razon(mezclar([t[0], t[1], t[2], t[3] * opacidad], fondo), fondo);
        }),
      );
      resultados.push({ r: Number(peor.toFixed(2)), t: `${texto} (degradado, peor color)`, grande });
      continue;
    }

    const fondo = fondoDe(el);
    const c = aRgba(cs.color);
    const frente = mezclar([c[0], c[1], c[2], c[3] * opacidad], fondo);
    resultados.push({ r: Number(razon(frente, fondo).toFixed(2)), t: texto, grande });
  }

  resultados.sort((a, b) => a.r - b.r);
  return {
    fecha: new Date().toISOString(),
    ruta: location.pathname,
    tema: document.documentElement.classList.contains("dark") ? "oscuro" : "claro",
    ventana: `${innerWidth}x${innerHeight}`,
    textos: resultados.length,
    minimo: resultados[0] ?? null,
    fallan: resultados.filter((x) => x.r < (x.grande ? 3 : 4.5)),
    peores: resultados.slice(0, 5),
  };
})();
