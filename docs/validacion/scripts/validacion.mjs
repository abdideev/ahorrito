/**
 * Reglas de evaluación de la validación (Fase 7), tal como las fija el protocolo aprobado
 * (`docs/validacion/protocolo-de-validacion.md`, versión 1.2). Funciones puras, sin dependencias
 * y sin acceso a red ni a archivos: reciben el registro anonimizado de cada evaluador y devuelven
 * su resultado.
 *
 * Unidades: los tiempos de la grabación son marcas "mm:ss" (o "h:mm:ss") medidas desde el inicio
 * del video; los de la base de datos, segundos (salida de `consulta-tiempos.sql`); las horas que
 * anota el evaluador, "HH:MM" del reloj de su dispositivo.
 */

/** Umbral de CA-20 y OBJ-02: 8 minutos (protocolo, sección 1). */
export const UMBRAL_SEGUNDOS = 8 * 60;
/** Diferencia máxima tolerada entre la grabación y la base de datos (protocolo, sección 7). */
export const TOLERANCIA_CONTRASTE_SEGUNDOS = 60;
/** Calificación mínima de OBJ-05 en cada pregunta (protocolo, sección 12). */
export const UMBRAL_OBJ05 = 4;

export const RESULTADO = Object.freeze({
  CUMPLE: "cumple",
  NO_CUMPLE: "no cumple",
  NO_CUMPLE_INFRAESTRUCTURA: "no cumple por infraestructura",
  CON_AYUDA: "con ayuda",
  EXCLUIDO: "excluido",
  PENDIENTE: "pendiente",
});

/**
 * Mediana: con un número par de datos, el promedio de los dos valores centrales. El script de
 * CA-08 tomaba el elemento n/2 (incidencia retroactiva de la mediana); esta función no.
 * @param {number[]} valores
 * @returns {number | null} null si no hay datos
 */
export function mediana(valores) {
  const datos = valores.filter((v) => typeof v === "number" && Number.isFinite(v)).sort((a, b) => a - b);
  if (datos.length === 0) return null;
  const mitad = Math.floor(datos.length / 2);
  return datos.length % 2 === 1 ? datos[mitad] : (datos[mitad - 1] + datos[mitad]) / 2;
}

/**
 * Convierte "mm:ss" o "h:mm:ss" a segundos. Devuelve null si el campo está vacío o "pendiente".
 * @param {string | null | undefined} marca
 */
export function aSegundos(marca) {
  if (marca === null || marca === undefined) return null;
  const texto = String(marca).trim();
  if (texto === "" || texto.toLowerCase() === "pendiente") return null;
  const partes = texto.split(":").map((p) => Number(p));
  if (partes.some((p) => !Number.isInteger(p) || p < 0) || partes.length < 2 || partes.length > 3) {
    throw new Error(`Marca de tiempo inválida: "${marca}" (se espera mm:ss o h:mm:ss)`);
  }
  if (partes.slice(1).some((p) => p > 59)) throw new Error(`Minutos o segundos fuera de rango: "${marca}"`);
  return partes.reduce((total, p) => total * 60 + p, 0);
}

/**
 * Diferencia en minutos entre dos horas "HH:MM" del mismo día; si la segunda es menor, se asume
 * que cruzó la medianoche.
 * @returns {number | null}
 */
export function minutosEntre(desde, hasta) {
  const h = (t) => {
    if (!t || String(t).trim().toLowerCase() === "pendiente") return null;
    const m = /^(\d{1,2}):(\d{2})$/.exec(String(t).trim());
    if (!m || Number(m[1]) > 23 || Number(m[2]) > 59) throw new Error(`Hora inválida: "${t}" (se espera HH:MM)`);
    return Number(m[1]) * 60 + Number(m[2]);
  };
  const a = h(desde);
  const b = h(hasta);
  if (a === null || b === null) return null;
  return b >= a ? b - a : b + 24 * 60 - a;
}

/**
 * Tiempos de la grabación (fuente principal, protocolo, secciones 7 y 8).
 * @param {object} g grabacion del registro
 */
export function tiemposGrabacion(g) {
  if (!g || g.estado !== "completa") return null;
  const t = {
    registroVisible: aSegundos(g.registroVisible),
    crearCuentaPulsado: aSegundos(g.crearCuentaPulsado),
    deVueltaConSesion: aSegundos(g.deVueltaConSesion),
    generarPulsado: aSegundos(g.generarPulsado),
    planVisible: aSegundos(g.planVisible),
  };
  const orden = Object.entries(t);
  if (orden.some(([, v]) => v === null)) {
    throw new Error("Grabación marcada como completa con marcas vacías: márcala como cortada o completa las marcas");
  }
  for (let i = 1; i < orden.length; i++) {
    if (orden[i][1] < orden[i - 1][1]) {
      throw new Error(`Marcas fuera de orden: ${orden[i][0]} es anterior a ${orden[i - 1][0]}`);
    }
  }
  return {
    total: t.planVisible - t.registroVisible,
    tramos: {
      formulario: t.crearCuentaPulsado - t.registroVisible,
      correo: t.deVueltaConSesion - t.crearCuentaPulsado,
      captura: t.generarPulsado - t.deVueltaConSesion,
      generacion: t.planVisible - t.generarPulsado,
    },
    // Intervalo comparable con la base de datos: de "Crear mi cuenta" al plan visible.
    comparableConBaseDeDatos: t.planVisible - t.crearCuentaPulsado,
  };
}

/**
 * Resultado de CA-20 para un evaluador (protocolo, secciones 6 a 10).
 * @param {object} r registro anonimizado de un evaluador
 */
export function evaluarEvaluador(r) {
  const observaciones = [];
  const grabacion = tiemposGrabacion(r.grabacion);
  const bd = r.baseDeDatos ?? {};
  const cotaInferior = typeof bd.sCreacionAPrimerPlan === "number" ? bd.sCreacionAPrimerPlan : null;
  const anotadoMin = minutosEntre(r.anotado?.horaInicio, r.anotado?.horaPlan);

  if (bd.ejecutadaAntesDelMensaje3 === false) {
    observaciones.push("La consulta se ejecutó después de la Parte B: no se usan primer_pago ni ultimo_acceso");
  }

  let contraste = null;
  if (grabacion && cotaInferior !== null) {
    contraste = grabacion.comparableConBaseDeDatos - cotaInferior;
    if (Math.abs(contraste) > TOLERANCIA_CONTRASTE_SEGUNDOS) {
      observaciones.push(
        `La grabación y la base de datos difieren ${contraste} s (más de ${TOLERANCIA_CONTRASTE_SEGUNDOS}): revisar la grabación y anotar la causa`,
      );
    }
  }

  const base = { evaluador: r.evaluador, perfil: r.perfil, grabacion, cotaInferior, anotadoMin, contraste, observaciones };

  if (r.experienciaPrevia?.excluido === true) {
    return { ...base, resultado: RESULTADO.EXCLUIDO, motivo: r.experienciaPrevia.motivo ?? "experiencia previa" };
  }
  if (r.correoNoLlegoEn10Min === true) {
    return { ...base, resultado: RESULTADO.NO_CUMPLE_INFRAESTRUCTURA, motivo: "el correo de confirmación no llegó en 10 minutos" };
  }
  if (r.ayuda?.recibida === true) {
    return { ...base, resultado: RESULTADO.CON_AYUDA, motivo: "recibió ayuda durante la parte medida" };
  }
  if (grabacion) {
    const cumple = grabacion.total <= UMBRAL_SEGUNDOS;
    return { ...base, resultado: cumple ? RESULTADO.CUMPLE : RESULTADO.NO_CUMPLE, motivo: `total de la grabación: ${grabacion.total} s` };
  }
  // Sin grabación completa: solo la cota inferior puede decidir, y solo si ya supera el umbral.
  if (cotaInferior !== null && cotaInferior > UMBRAL_SEGUNDOS) {
    return { ...base, resultado: RESULTADO.NO_CUMPLE, motivo: `sin grabación completa; la cota inferior de la base de datos (${cotaInferior} s) ya supera ${UMBRAL_SEGUNDOS} s` };
  }
  return { ...base, resultado: RESULTADO.PENDIENTE, motivo: "sin grabación completa; no se completa con horas anotadas ni estimaciones" };
}

/**
 * Evaluadores válidos para CA-20: los no excluidos. Un sustituto (campo `sustituyeA`) ocupa el lugar
 * del excluido. CA-20 pide 3 de 3.
 * @param {object[]} registros
 */
export function evaluarCA20(registros) {
  const individuales = registros.map(evaluarEvaluador);
  const validos = individuales.filter((x) => x.resultado !== RESULTADO.EXCLUIDO);
  const faltan = Math.max(0, 3 - validos.length);
  const cumplen = validos.filter((x) => x.resultado === RESULTADO.CUMPLE).length;
  const pendientes = validos.filter((x) => x.resultado === RESULTADO.PENDIENTE).length;
  let resultado;
  if (validos.length > 3) resultado = "revisar: hay más de tres evaluadores válidos";
  else if (cumplen === 3) resultado = RESULTADO.CUMPLE;
  else if (validos.length - pendientes - cumplen > 0) resultado = RESULTADO.NO_CUMPLE;
  else resultado = RESULTADO.PENDIENTE; // faltan evaluadores válidos o hay resultados pendientes
  const tiempos = validos.map((x) => x.grabacion?.total).filter((t) => typeof t === "number");
  return {
    resultado,
    cumplen,
    validos: validos.length,
    faltanSustitutos: faltan,
    individuales,
    // Descriptivo: no decide el criterio, que es 3 de 3.
    medianaTotalSegundos: mediana(tiempos),
  };
}

/**
 * OBJ-05 (protocolo, sección 12): cada evaluador válido por separado, cada pregunta por separado,
 * sin promediar. Las calificaciones de un excluido se conservan como observación.
 * @param {object[]} registros
 */
export function evaluarOBJ05(registros) {
  const valida = (n) => Number.isInteger(n) && n >= 1 && n <= 5;
  const filas = registros.map((r) => {
    const { claridad, accionabilidad } = r.obj05 ?? {};
    for (const [nombre, valor] of [["claridad", claridad], ["accionabilidad", accionabilidad]]) {
      if (valor !== null && valor !== undefined && !valida(valor)) {
        throw new Error(`${r.evaluador}: ${nombre} debe ser un entero de 1 a 5 (recibido ${valor})`);
      }
    }
    const excluido = r.experienciaPrevia?.excluido === true;
    let resultado;
    if (!valida(claridad) || !valida(accionabilidad)) resultado = RESULTADO.PENDIENTE;
    else resultado = claridad >= UMBRAL_OBJ05 && accionabilidad >= UMBRAL_OBJ05 ? RESULTADO.CUMPLE : RESULTADO.NO_CUMPLE;
    return { evaluador: r.evaluador, claridad: claridad ?? null, accionabilidad: accionabilidad ?? null, resultado, cuenta: !excluido };
  });
  const cuentan = filas.filter((f) => f.cuenta);
  let resultado;
  if (cuentan.length < 3 || cuentan.some((f) => f.resultado === RESULTADO.PENDIENTE)) {
    resultado = cuentan.some((f) => f.resultado === RESULTADO.NO_CUMPLE) ? RESULTADO.NO_CUMPLE : RESULTADO.PENDIENTE;
  } else {
    resultado = cuentan.every((f) => f.resultado === RESULTADO.CUMPLE) ? RESULTADO.CUMPLE : RESULTADO.NO_CUMPLE;
  }
  return { resultado, filas };
}

/** Formatea segundos como "m min s s". */
export function legible(segundos) {
  if (typeof segundos !== "number") return "pendiente";
  const signo = segundos < 0 ? "−" : "";
  const s = Math.abs(segundos);
  return `${signo}${Math.floor(s / 60)} min ${s % 60} s`;
}
