# MSPAS-01.5 - Congelamiento de Arquitectura del Motor MSPAS

## Evidencia Tecnica Auditada
- Motor MSPAS actual: contrato + pipeline unico de idioma predominante + utilidades de catalogo/normalizacion.
- Pruebas actuales del engine: 5/5 exitosas en bloque de idioma.
- Plantilla oficial MSPAS: hoja 170 columnas x 4 filas estructurales.
- Formulas detectadas en plantilla: 3 (E4=D4*100/C4, H4=G4*100/F4, K4=J4*100/I4).
- Validaciones de datos de Excel detectadas en plantilla: 0.
- Inventario contractual base: 170 campos distribuidos en 35 bloques funcionales.

## Veredicto de Arquitectura (Bloques Funcionales vs Columnas)
- SI es viable y tecnicamente superior implementar por bloques funcionales usando transformadores genericos configurados por contratos.
- Motivo principal: 162/170 columnas son one-hot o derivadas de patrones repetibles; columna-a-columna introduce duplicacion y alto riesgo de inconsistencia.
- El motor actual ya demuestra el patron correcto en idioma predominante (contrato + catalogo + transformer reutilizable).

## Politica 1/Vacio vs 0 (Auditoria de plantilla)
- No hay evidencia tecnica en la plantilla oficial que obligue a usar 0 en columnas no seleccionadas (sin data validations y solo 3 formulas en E4/H4/K4 no relacionadas con one-hot).
- Recomendacion de congelamiento: politica por defecto seleccionado=1, no seleccionado=vacio.
- Excepcion controlada: permitir estrategia alternativa con 0 via contrato solo si MSPAS documenta explicitamente ese requerimiento en una seccion concreta.

## Inventario de Bloques Funcionales
- Total bloques: 35
- Total campos: 170
- Campos one-hot (catalogos + likert + recomendacion): 158
- Campos calculados: 3
- Bloques imposibles actualmente: 2 (campos afectados: 29)
- Ver detalle completo en MSPAS_FUNCTIONAL_BLOCKS_INVENTORY.csv.

## Inventario de Transformadores (Objetivo)
- OneHotTransformer
- LikertTransformer
- YesNeutralNoTransformer
- DirectValueTransformer
- CalculatedValueTransformer
- ConditionalTransformer
- CustomBusinessRuleTransformer (solo excepciones)
- Ver estado/reutilizacion en MSPAS_TRANSFORMERS_INVENTORY.csv.

## Transformadores Actuales Reutilizables y Sobrantes
- Reutilizables: normalizacion de catalogos, resolucion catalogo->codigo, generacion one-hot, patron de contrato por bloque, patron de pruebas unitarias.
- Sobran como piezas especificas: pipeline dedicado mapIdiomaPredominanteToExcel debe evolucionar a invocacion generica por contrato (no escalar con N pipelines por pregunta).

## Inventario de Contratos Requeridos
- Un contrato por bloque funcional (35 contratos).
- Ver listado completo en MSPAS_CONTRACTS_INVENTORY.csv.

## Secciones con Reglas de Negocio Especiales
- No. de pacientes COEX del periodo (C/F/I): requiere fuente externa o captura operacional previa.
- % de encuestas (E/H/K): calculadas con guardia de division por cero.
- Forma de aplicacion (L): codificacion oficial impreso/digital pendiente.
- Idioma predominante (Q..AP): fallback a Otro para valores no mapeados.
- Sexo (AQ..AR): tratamiento normativo para valor Otro.
- Servicio (AS..AU): equivalencia consulta_externa <-> COEX.
- Bloques condicionales de apoyo/encamamiento: cuando no aplica, dejar vacio por politica de contrato.

## Dependencias Entre Preguntas / Datos
- Dependencias calculadas: E, H, K dependen de (D/C), (G/F), (J/I).
- Dependencias condicionales: servicios de apoyo (BU..CX) y encamamiento (EW..FF) dependen de aplicabilidad del servicio.
- Dependencias de agregacion: C..K dependen de ventana temporal y consolidacion de respuestas.

## Independencia del Motor MSPAS
- Estado actual: parcialmente independiente (modulo aislado en backend/report-engine/mspas), pero incompleto.
- Requisito de congelamiento: entrada = datos normalizados neutrales; salida = workbook MSPAS; sin dependencias directas de React/Sequelize/PostgreSQL.
- Gap actual: no existe aun orquestador generico ni writer completo A..FN desacoplado por contratos.

## Riesgos Tecnicos
- Riesgo alto: continuar columna-a-columna aumenta deuda tecnica y divergencias entre bloques equivalentes.
- Riesgo alto: brechas de datos no resueltas (idioma + COEX periodo) bloquean cumplimiento completo.
- Riesgo medio: reglas de vacio/0 no formalizadas por contrato pueden generar salidas inconsistentes.
- Riesgo medio: codificaciones semanticas (sexo, servicio, modo de aplicacion) sin consenso operativo.

## Porcentaje Estimado de Reutilizacion del Codigo Actual
- Estimacion: 35.71% de los modulos objetivo del engine final pueden derivarse/reutilizarse del codigo actual.
- Base de estimacion: 5 componentes reutilizables identificados sobre 14 componentes objetivo del engine contractual.

## Plan de Implementacion por Fases (sin ejecutar en esta auditoria)
1. Fase A - Congelamiento contractual: aprobar politica 1/vacio, reglas de fallback y listado final de 35 contratos.
2. Fase B - Core generico: contract loader, row validator, one-hot/direct/calculated/conditional transformers, audit trace.
3. Fase C - Contratos por bloque: implementar contratos sin logica hardcodeada en motor.
4. Fase D - Integracion workbook: writer A..FN + pruebas golden-file vs plantilla.
5. Fase E - Brechas de datos: resolver idioma predominante y fuente COEX por periodo antes de certificacion final.

## Arquitectura Definitiva Recomendada
- Orquestador por contratos de bloque + transformadores genericos + writer unico de workbook + trazabilidad por fila/columna.
- Sin hardcode por pregunta dentro del engine.
- Politicas (fallback, vacio/0, validaciones, aplicabilidad) declaradas en contratos, no en pipelines ad-hoc.

## Conclusión
- La arquitectura por bloques funcionales con transformadores genericos es superior tecnica y operacionalmente frente al enfoque columna-a-columna.
- Justificacion: reduce duplicacion, centraliza reglas, mejora trazabilidad, habilita pruebas sistematicas y desacopla el motor del stack de captura.