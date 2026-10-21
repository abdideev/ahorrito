/**
 * Procesa el registro anonimizado de las sesiones de validación y escribe en la salida estándar el
 * resultado de CA-20, OBJ-02 y OBJ-05, en Markdown, con las reglas de `validacion.mjs`.
 *
 *   node docs/validacion/scripts/procesar-validacion.mjs docs/validacion/registros/registro-sesiones.json
 *
 * El archivo de entrada solo contiene E1, E2 y E3: ningún nombre, correo ni video (protocolo,
 * sección 15). Lo que no tenga evidencia se escribe "pendiente" o se deja en null.
 */
import { readFileSync } from "node:fs";
import { evaluarCA20, evaluarOBJ05, legible, UMBRAL_SEGUNDOS } from "./validacion.mjs";

const ruta = process.argv[2];
if (!ruta) {
  console.error("Uso: node docs/validacion/scripts/procesar-validacion.mjs <registro-sesiones.json>");
  process.exit(1);
}

const datos = JSON.parse(readFileSync(ruta, "utf8"));
const registros = datos.evaluadores;
const ca20 = evaluarCA20(registros);
const obj05 = evaluarOBJ05(registros);

const lineas = [];
lineas.push(`# Resultados procesados de la validación`);
lineas.push("");
lineas.push(`Entrada: \`${ruta}\` · procesado: ${new Date().toISOString()} · umbral: ${UMBRAL_SEGUNDOS} s`);
lineas.push("");
lineas.push(`## CA-20 y OBJ-02: del registro al primer plan`);
lineas.push("");
lineas.push("| Evaluador | Perfil | Total (grabación) | Formulario | Correo | Captura | Generación | Cota inferior BD | Grabación − BD | Anotado | Resultado | Motivo |");
lineas.push("|---|---|---|---|---|---|---|---|---|---|---|---|");
for (const x of ca20.individuales) {
  const t = x.grabacion?.tramos;
  lineas.push(
    `| ${x.evaluador} | ${x.perfil} | ${legible(x.grabacion?.total)} | ${legible(t?.formulario)} | ${legible(t?.correo)} | ${legible(t?.captura)} | ${legible(t?.generacion)} | ${legible(x.cotaInferior)} | ${x.contraste === null ? "—" : `${x.contraste} s`} | ${x.anotadoMin === null ? "pendiente" : `${x.anotadoMin} min`} | **${x.resultado}** | ${x.motivo} |`,
  );
}
lineas.push("");
lineas.push(`**CA-20: ${ca20.resultado}** (${ca20.cumplen} de ${ca20.validos} válidos cumplen; se requieren 3 de 3${ca20.faltanSustitutos ? `; faltan ${ca20.faltanSustitutos} sustituto(s)` : ""}).`);
lineas.push(`**OBJ-02:** se evalúa con la misma medición: ${ca20.resultado}.`);
lineas.push(`Mediana descriptiva del tiempo total (promedio de los dos centrales si son pares): ${legible(ca20.medianaTotalSegundos)}. No decide el criterio.`);
const obs = ca20.individuales.flatMap((x) => x.observaciones.map((o) => `- ${x.evaluador}: ${o}`));
if (obs.length) {
  lineas.push("");
  lineas.push("Observaciones del contraste:");
  lineas.push(...obs);
}
lineas.push("");
lineas.push(`## OBJ-05: claridad y accionabilidad (sin promediar)`);
lineas.push("");
lineas.push("| Evaluador | Claridad | Accionabilidad | Resultado | ¿Cuenta? |");
lineas.push("|---|---|---|---|---|");
for (const f of obj05.filas) {
  lineas.push(`| ${f.evaluador} | ${f.claridad ?? "pendiente"} | ${f.accionabilidad ?? "pendiente"} | **${f.resultado}** | ${f.cuenta ? "sí" : "no (excluido; se conserva como observación)"} |`);
}
lineas.push("");
lineas.push(`**OBJ-05: ${obj05.resultado}** (4 o más en las dos preguntas, para cada uno de los tres evaluadores válidos).`);
console.log(lineas.join("\n"));
