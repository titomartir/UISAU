# MSPAS - Arquitectura del Motor de Exportacion (Contract-First)

## Modulos necesarios
- contract-loader: carga y valida FINAL_EXPORT_CONTRACT.json
- input-normalizer: normaliza texto/codigos por estrategia declarada
- catalog-resolver: resuelve equivalencias de catalogos (idioma, sexo, servicio, origen etnico, escalas)
- onehot-transformer: aplica marcado unico por bloque
- scalar-transformer: mapeo directo de numericos y textos
- formula-guard: protege divisiones por cero y celdas calculadas
- row-validator: valida integridad de una fila antes de escribir
- workbook-writer: escribe columnas A..FN respetando layout
- audit-trace: genera evidencia por fila/columna (input->output)

## Catalogos a implementar (posterior a aprobacion)
- Origen etnico (M..P)
- Idioma predominante (Q..AP)
- Sexo (AQ..AR)
- Servicio donde fue atendido (AS..AU)
- Escalas Likert MS/S/N/I/MI por todos los bloques de experiencia (AV..FK)
- Referiria el servicio (FL..FN)

## Validadores requeridos
- schema-validator del contrato
- one-hot-validator por bloque
- catalog-membership-validator
- numeric-range-validator para conteos y porcentajes
- completeness-validator para columnas obligatorias de exportacion

## Pruebas automatizadas necesarias
- Unit: normalizacion y resolucion de catalogos
- Unit: one-hot por bloque (exactamente una opcion o fallback)
- Unit: formulas/guardas E,H,K
- Integration: fila completa A..FN
- Golden-file: comparacion de workbook generado contra plantilla de referencia
- Regression: casos limite (null, acentos, valores no esperados)

## Integracion con pipeline
- El pipeline debe invocar contract-loader al inicio
- Transformaciones deben ser 100% guiadas por contrato (sin hardcode adicional)
- No cambiar layout ni orden de columnas fuera del contrato
- Emitir reporte de trazabilidad por cada ejecucion