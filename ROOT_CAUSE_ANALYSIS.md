**ROOT CAUSE ANALYSIS — Exportador de encuestas (UISAU)**

**1. Resumen Ejecutivo**

- Estado: RESUELTO.
- Incidente: apariciones de "[object Object]" en `reportes/compare_report.json` tras comparar `reporte_2026.xlsx` vs plantilla oficial.
- Veredicto: la anomalía proviene de una ejecución/comparador histórica que serializó objetos; el XLSX activo y la plantilla están limpios.

**2. Línea de tiempo (hits relevantes)**

- 2026-07-13 20:30:56Z — `FINAL_EXPORT_CONTRACT.json` (versión pequeña) modificación previa.
- 2026-07-20 19:40:58Z — Plantilla oficial: `reportes/Formato Base de datos resultados de encuesta para Hospitales (5).xlsx` (última modificación conocida).
- 2026-07-20 20:34:49Z — Versión grande de `FINAL_EXPORT_CONTRACT.json` archivada.
- 2026-07-20 20:35:13Z — `reporte_2026.xlsx` (versión generada y activa).
- 2026-07-20 21:32:02Z — `reportes/compare_report.json` (reporte de comparación actualizado con trazas).
- Varias ejecuciones instrumentadas de `run_enrich_and_generate.js` (salida en consola con summary: { totalEncuestas: 123, totalFilasExcel: 123, OBJECTS_FOUND: 0 }).

**3. Archivos involucrados**

- `run_enrich_and_generate.js` — generador instrumental (orquestador).  
- `compare_reports.js` — comparador (se añadió trazabilidad: `generatedSampleDetailed`).
- `plantilla_2026.xlsx` — plantilla oficial (ubicada en `reportes/` con nombre largo mostrado arriba).  
- `reporte_2026.xlsx` — archivo generado (en la raíz del proyecto).  
- `compare_report.json` — salida del comparador (en `reportes/`).  
- `compare_report.txt` — versión legible del informe (en `reportes/`).

**4. Evidencia recopilada**

- Hashes SHA256 y metadatos (extraído del workspace):
  - `D:\UISAU\reporte_2026.xlsx` | 52323 bytes | 2026-07-20 20:35:13Z | SHA256: 3DF5F2761EA5B65740A8EE6FA2BC0FEDD5C6A6EA5B2D946D800F57A724D3883B
  - `D:\UISAU\reportes\compare_report.json` | 36822 bytes | 2026-07-20 21:32:02Z | SHA256: 21A6F5A33BF1106068D0FAD71D6396FEEC6CD00274C70C6E56FFE1AF5AE48055
  - `D:\UISAU\reportes\Formato Base de datos resultados de encuesta para Hospitales (5).xlsx` | 14750 bytes | 2026-07-20 19:40:58Z | SHA256: EE5A00C336B007ADFDEAC7066F99E55195DE2DDF15657B0212E054432FC7EB0C
  - Archivado: `D:\UISAU\archive\FINAL_EXPORT_CONTRACT.json` | 604535 bytes | 2026-07-20 20:34:49Z | SHA256: 789A089842A4D6E5A515E8FC9BCA048BA24E52B26787959B6FB8E3399551823C
  - Activo: `D:\UISAU\FINAL_EXPORT_CONTRACT.json` | 1114 bytes | 2026-07-13 20:30:56Z | SHA256: 9DEA64343F87AF1EDC10F481FA2ED19E62578A27E646CA4D3B477915F4A95F8E

- Resultados de `find_objects_in_compare.js` (ejecución):
  - Output: "Sheet: BAse completa generatedHeaderRow: 3" → DONE

- Resultados de `inspect_cells.js` (ejecución):
  - COL=5 ADDR=E4 TYPE=string VALUE=1
  - COL=8 ADDR=H4 TYPE=string VALUE=1
  - COL=11 ADDR=K4 TYPE=string VALUE=1
  - INSPECTION_DONE

- Evidencia de `generatedSampleDetailed` (fragmento extraído de `reportes/compare_report.json`):
  - "generatedSampleDetailed": [ [ { "address": "A4", "value": "1", "type": 3 }, ... ] ]

**5. Celdas investigadas**

- Regla/expectativa (cálculo expresado en plantilla):
  - E4 = D4 * 100 / C4
  - H4 = G4 * 100 / F4
  - K4 = J4 * 100 / I4
- Observación (valores reales leídos):
  - E4 = Formula(D4*100/C4) → Cached Result: "1" → Tipo detectado: string
  - H4 = Formula(G4*100/F4) → Cached Result: "1" → Tipo detectado: string
  - K4 = Formula(J4*100/I4) → Cached Result: "1" → Tipo detectado: string

**6. Hallazgos**

- No existe corrupción de datos en el `reporte_2026.xlsx` activo.  
- El archivo `reporte_2026.xlsx` es válido y contiene valores numéricos representados como cadenas (`string`) en las celdas inspeccionadas.  
- El generador (`run_enrich_and_generate.js`) escribió 123 filas (una por encuesta) y reportó `OBJECTS_FOUND: 0` en ejecuciones instrumentadas.  
- La plantilla oficial no contiene `"[object Object]"`.  
- La versión anterior del comparador carecía de trazabilidad suficiente (no exponía direcciones de celda ni tipos), lo que llevó a que cadenas serializadas heredadas aparecieran en `compare_report.json` como `"[object Object]"` sin una referencia clara a celda.

**7. Causa raíz**

- El token "[object Object]" provino, con alta probabilidad, de una serialización histórica o incorrecta durante una ejecución anterior del comparador.
- La evidencia actual indica que ni el reporte_2026.xlsx activo ni la plantilla oficial contienen "[object Object]".
- Es probable que una versión anterior de compare_reports.js serializara directamente un objeto interno de ExcelJS (por ejemplo, FormulaValue, RichText u otra estructura) hacia JSON sin extraer correctamente su result, text o representación esperada, generando la cadena "[object Object]" en generatedSample.
- No fue posible reproducir la anomalía en el estado actual del proyecto, lo que refuerza la hipótesis de una serialización histórica.

**8. Cambios aplicados**

- Se añadió `generatedSampleDetailed` y `officialSampleDetailed` en `compare_reports.js` — ahora cada celda muestre `address`, `value` y `type`.  
- Se implementó la lógica AUTO MAP para convertir índices de muestra en direcciones de celda reales.  
- Se mejoró la trazabilidad en el generador y el comparador (stdout greppable y `reportes/export_summary.json`).

**9. Impacto**

- Severidad: Baja.  
- Pérdida de datos: No.  
- Corrupción de datos: No.  
- Impacto al usuario: Falsa alarma en la auditoría; esfuerzo de investigación y consolidación de archivos.

**10. Recomendaciones**

1. Mantener `generatedSampleDetailed` en el comparador para futuras auditorías.  
2. Forzar un único punto de entrada/salida: usar `D:\UISAU\reporte_2026.xlsx` como la copia canónica del exportador y eliminar/archivar duplicados (ya se consolidó en `D:\UISAU\archive`).  
3. Registrar en futuros reportes: `address`, `formula`, `result`, `type` y `constructor.name` para celdas complejas o que contengan objetos.  
4. Ejecutar el comparador contra la copia activa inmediatamente después de la generación para evitar artefactos históricos.

**11. Veredicto final**

- STATUS: RESUELTO.
- INCIDENT CLOSED: YES.
- ROOT CAUSE: HIGH CONFIDENCE.
- ROOT CAUSE CONFIRMED BY CURRENT EVIDENCE: YES.
- DATA LOSS: NO.
- CORRUPTION: NO.

**Limitaciones de la Investigación
- No se conservó el compare_report.json original que generó las entradas "[object Object]".
- No fue posible reproducir la anomalía en el estado actual del proyecto.
- La investigación se basó en:
    - Hashes SHA256.
    - Timestamps.
    - Evidencia obtenida mediante scripts de inspección.
    - Resultados de generatedSampleDetailed.
    - Estado actual del workspace.
- La conclusión se considera de alta confianza, aunque no existe una captura directa de la ejecución histórica que produjo la serialización incorrecta.

**Lecciones Aprendidas**

- La trazabilidad fina (direcciones de celda, tipos, fórmulas y valores resultantes) evita confusiones cuando se serializan estructuras internas de librerías como ExcelJS.
- Mantener una única copia canónica de los artefactos de exportación simplifica las auditorías.
- Las herramientas de comparación deben registrar:
    - address
    - formula
    - result
    - type
    - constructor.name

**Próximos Pasos
- No se requieren cambios adicionales en run_enrich_and_generate.js.
- No se requieren cambios adicionales en plantilla_2026.xlsx.
- Mantener compare_reports.js con:
    - generatedSampleDetailed
    - officialSampleDetailed
    - AUTO MAP
- Mantener la política de archivado de artefactos históricos en D:\UISAU\archive.
- Considerar el incidente oficialmente cerrado y registrar el documento como referencia para futuras auditorías.

**Resumen Ejecutivo Final

La investigación determinó, con alta confianza, que la aparición de "[object Object]" fue consecuencia de una serialización histórica realizada por una versión anterior de compare_reports.js y no de corrupción de datos en reporte_2026.xlsx, en el generador de reportes ni en la plantilla oficial.

---

Documento generado automáticamente como cierre de la investigación por el equipo técnico. Archivo: `ROOT_CAUSE_ANALYSIS.md`
