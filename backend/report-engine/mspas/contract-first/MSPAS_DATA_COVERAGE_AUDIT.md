# MSPAS-01.5 Auditoria de Cobertura de Datos (UISAU)

## Alcance auditado
- Formulario actual (frontend de encuesta)
- Base de datos y dump SQL disponible
- Modelos Sequelize y relaciones
- Seeder de preguntas/opciones
- Preguntas existentes y respuestas almacenadas
- Contrato MSPAS y matriz de mapeos Contract-First
- Endpoints de captura y exportaciones administrativas actuales

## Resumen ejecutivo
- Total de columnas MSPAS auditadas: 170
- Puede completarse hoy: 8 (4.71%)
- Requiere cambios menores: 133 (78.24%)
- Requiere cambios mayores: 0 (0.00%)
- Imposible completar con informacion actual: 29 (17.06%)

## Hallazgos clave
- Brecha critica: idioma predominante (26 columnas Q-AP) no se captura en formulario ni en base de datos.
- Brecha operativa: columnas C/F/I (pacientes COEX del periodo) no existen en el modelo de captura UISAU.
- Cobertura alta en bloques Likert: trato, comunicacion, tiempo, encamamiento, satisfaccion global y recomendacion.
- Reglas pendientes: codificacion impreso/digital, mapeo consulta_externa->COEX y tratamiento de valores Otro en sexo/origen etnico.

## Artefactos generados
- Matriz CSV: d:\UISAU\backend\report-engine\mspas\contract-first\MSPAS_DATA_COVERAGE_MATRIX.csv
- Matriz JSON: d:\UISAU\backend\report-engine\mspas\contract-first\MSPAS_DATA_COVERAGE_MATRIX.json

## Notas metodologicas
- Esta fase es de auditoria funcional: no se implementaron cambios de codigo del motor MSPAS.
- Los estados se determinaron con evidencia de contrato, formulario, modelos, endpoints y dump SQL del proyecto.