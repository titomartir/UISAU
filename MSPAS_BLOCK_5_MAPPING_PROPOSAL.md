# MSPAS_BLOCK_5_MAPPING_PROPOSAL

## 1. Alcance de esta fase

Esta fase es exclusivamente contractual.

- No se implementa código.
- No se consultan datos reales.
- No se modifica el exportador.
- No se hace staging, commit ni push.

Fuentes usadas en modo solo lectura:

- Plantilla oficial MSPAS: `backend/report-engine/mspas/mspas-header-template.xlsx`
- Seeder vigente: `backend/src/seeders/runSeed.js`
- Endpoint/estructura de encuesta activa: `backend/src/routes/encuestaRoutes.js`, `backend/src/controllers/encuestaController.js`
- Estructura de preguntas/opciones: `backend/src/models/Pregunta.js`, `backend/src/models/OpcionRespuesta.js`
- Artefactos contractuales internos de apoyo: `backend/report-engine/mspas/contract-first/*.csv`, `backend/report-engine/mspas/contract-first/FINAL_EXPORT_CONTRACT.json`

## 2. Veredicto ejecutivo

- Rango contractual operativo de MSPAS-5A: `BV..CY`
- Columna siguiente bloque: `CZ`
- Total de columnas del bloque MSPAS-5A: `30`
- Total de subpreguntas: `6`
- Tipo de bloque: `Likert one-hot`, cinco columnas por subpregunta, secuencia `MS/S/N/I/MI`

Observación contractual crítica:

- Los artefactos CSV internos del motor aún reflejan una versión corrida que ubica este bloque como `BU..CX`.
- Para MSPAS-5A, la plantilla debe tratarse como fuente primaria, porque el bloque anterior aprobado cerró en `AW..BU` y la siguiente columna contractual pendiente es `BV`.
- En consecuencia, este documento fija el alcance pendiente como `BV..CY`, y deja la discrepancia `BU..CX` vs `BV..CY` como decisión explícita a revisar antes de MSPAS-5B.

## 3. Evidencia de plantilla

### 3.1 Rango exacto

- Primera columna pendiente del bloque: `BV`
- Última columna del mismo bloque: `CY`
- Primera columna del bloque siguiente: `CZ`

### 3.2 Merge principal

Texto principal del bloque:

- `TRATO Y ATENCIÓN EN LOS SERVICIOS DE APOYO`

Rango contractual fijado para MSPAS-5A:

- `BV1:CY1`

Nota:

- Los artefactos contractuales heredados muestran el mismo título de sección, pero desplazado una columna a la izquierda. Ese desfase no se adopta como contrato final de esta fase.

### 3.3 Merges internos

Cada subpregunta ocupa `5` columnas.

- `BV2:BZ2` → `Psicología`
- `CA2:CE2` → `Nutrición`
- `CF2:CJ2` → `Trabajo Social`
- `CK2:CO2` → `Laboratorio Clínico`
- `CP2:CT2` → `Imágenes Diagnosticas (rayos x, ultrasonido)`
- `CU2:CY2` → `UISAU`

### 3.4 Secuencia de fila 3

Cada grupo usa la misma secuencia literal de opciones en la fila 3:

- `MS`
- `S`
- `N`
- `I`
- `MI`

## 4. Encabezados literales MSPAS

### 4.1 Fila 1

- `BV1:CY1` → `TRATO Y ATENCIÓN EN LOS SERVICIOS DE APOYO`
- `CZ1:DD1` → inicio del siguiente bloque: `COMUNICACIÓN E INFORMACIÓN`

### 4.2 Fila 2

- `BV2:BZ2` → `Psicología`
- `CA2:CE2` → `Nutrición`
- `CF2:CJ2` → `Trabajo Social`
- `CK2:CO2` → `Laboratorio Clínico`
- `CP2:CT2` → `Imágenes Diagnosticas (rayos x, ultrasonido)`
- `CU2:CY2` → `UISAU`
- `CZ2:DD2` → siguiente subpregunta del bloque siguiente: `Claridad de información sobre estado de salud`

### 4.3 Fila 3 columna por columna

#### Psicología

- `BV3` → `MS`
- `BW3` → `S`
- `BX3` → `N`
- `BY3` → `I`
- `BZ3` → `MI`

#### Nutrición

- `CA3` → `MS`
- `CB3` → `S`
- `CC3` → `N`
- `CD3` → `I`
- `CE3` → `MI`

#### Trabajo Social

- `CF3` → `MS`
- `CG3` → `S`
- `CH3` → `N`
- `CI3` → `I`
- `CJ3` → `MI`

#### Laboratorio Clínico

- `CK3` → `MS`
- `CL3` → `S`
- `CM3` → `N`
- `CN3` → `I`
- `CO3` → `MI`

#### Imágenes Diagnosticas (rayos x, ultrasonido)

- `CP3` → `MS`
- `CQ3` → `S`
- `CR3` → `N`
- `CS3` → `I`
- `CT3` → `MI`

#### UISAU

- `CU3` → `MS`
- `CV3` → `S`
- `CW3` → `N`
- `CX3` → `I`
- `CY3` → `MI`

#### Evidencia del siguiente bloque

- `CZ3` → `MS`
- `DA3` → `S`
- `DB3` → `N`
- `DC3` → `I`
- `DD3` → `MI`

## 5. Inventario de preguntas UISAU candidatas

La encuesta activa se expone por `GET /api/encuesta/activa` y devuelve la encuesta activa con `preguntas` y `opciones` ordenadas por `orden`.

El seeder vigente define una encuesta única activa con este bloque funcional:

### Pregunta de dependencia del bloque

| Orden | ID estable | Código estable | Categoría | Tipo | Texto | Opciones | Dependencia | Aplicabilidad |
|---|---:|---|---|---|---|---|---|---|
| 6 | No congelado por contrato | No existe | servicios_apoyo | checkbox | ¿Cuáles de los siguientes servicios de apoyo recibió durante su visita? (Seleccione todos los que apliquen) | Psicología, Nutrición, Trabajo Social, Laboratorio Clínico, Imágenes Diagnósticas, UISAU | null | Define qué subpreguntas 7-12 aplican |

### Subpreguntas candidatas del bloque BV..CY

| Orden | ID estable | Código estable | Categoría | Tipo | Texto | Opciones | Dependencia | Aplicabilidad |
|---|---:|---|---|---|---|---|---|---|
| 7 | No congelado por contrato | No existe | servicios_apoyo | likert_5 | ¿Cómo califica la atención recibida por el servicio de Psicología? | Muy Satisfecho, Satisfecho, Neutral, Insatisfecho, Muy Insatisfecho | `{ campo: 'servicio_seleccionado', valor: 'psicologia' }` | Solo si en la pregunta 6 se seleccionó Psicología |
| 8 | No congelado por contrato | No existe | servicios_apoyo | likert_5 | ¿Cómo califica la atención recibida por el servicio de Nutrición? | Muy Satisfecho, Satisfecho, Neutral, Insatisfecho, Muy Insatisfecho | `{ campo: 'servicio_seleccionado', valor: 'nutricion' }` | Solo si en la pregunta 6 se seleccionó Nutrición |
| 9 | No congelado por contrato | No existe | servicios_apoyo | likert_5 | ¿Cómo califica la atención recibida por el servicio de Trabajo Social? | Muy Satisfecho, Satisfecho, Neutral, Insatisfecho, Muy Insatisfecho | `{ campo: 'servicio_seleccionado', valor: 'trabajo_social' }` | Solo si en la pregunta 6 se seleccionó Trabajo Social |
| 10 | No congelado por contrato | No existe | servicios_apoyo | likert_5 | ¿Cómo califica la atención recibida por el servicio de Laboratorio Clínico? | Muy Satisfecho, Satisfecho, Neutral, Insatisfecho, Muy Insatisfecho | `{ campo: 'servicio_seleccionado', valor: 'laboratorio' }` | Solo si en la pregunta 6 se seleccionó Laboratorio Clínico |
| 11 | No congelado por contrato | No existe | servicios_apoyo | likert_5 | ¿Cómo califica la atención recibida por el servicio de Imágenes Diagnósticas? | Muy Satisfecho, Satisfecho, Neutral, Insatisfecho, Muy Insatisfecho | `{ campo: 'servicio_seleccionado', valor: 'imagenes' }` | Solo si en la pregunta 6 se seleccionó Imágenes Diagnósticas |
| 12 | No congelado por contrato | No existe | servicios_apoyo | likert_5 | ¿Cómo califica la atención recibida por UISAU (Unidad de Información en Salud)? | Muy Satisfecho, Satisfecho, Neutral, Insatisfecho, Muy Insatisfecho | `{ campo: 'servicio_seleccionado', valor: 'uisau' }` | Solo si en la pregunta 6 se seleccionó UISAU |

Notas contractuales del inventario:

- El modelo `Pregunta` no define un `codigo` estable; el identificador contractual confiable es `orden`.
- El `id` de base de datos es autoincremental y no queda congelado por el seeder como contrato funcional portable.
- El endpoint de encuesta activa devuelve preguntas y opciones ordenadas, por lo que el orden contractual 6-12 es verificable sin depender de un ID numérico persistente.

## 6. Matriz de correspondencia MSPAS ↔ UISAU

| Rango MSPAS | Encabezado MSPAS | Opciones columnas | Pregunta UISAU candidata | Orden UISAU | Texto UISAU | Clasificación | Transformación requerida | Dependencia | Política histórica | Riesgo | Decisión PO |
|---|---|---|---|---:|---|---|---|---|---|---|---|
| BV..BZ | Psicología | MS/S/N/I/MI | Psicología | 7 | ¿Cómo califica la atención recibida por el servicio de Psicología? | Equivalencia semántica | Likert 5 → one-hot 5 columnas | Pregunta 6 contiene `psicologia` | 1 seleccionado, resto vacío | Bajo | No |
| CA..CE | Nutrición | MS/S/N/I/MI | Nutrición | 8 | ¿Cómo califica la atención recibida por el servicio de Nutrición? | Equivalencia semántica | Likert 5 → one-hot 5 columnas | Pregunta 6 contiene `nutricion` | 1 seleccionado, resto vacío | Bajo | No |
| CF..CJ | Trabajo Social | MS/S/N/I/MI | Trabajo Social | 9 | ¿Cómo califica la atención recibida por el servicio de Trabajo Social? | Equivalencia semántica | Likert 5 → one-hot 5 columnas | Pregunta 6 contiene `trabajo_social` | 1 seleccionado, resto vacío | Bajo | No |
| CK..CO | Laboratorio Clínico | MS/S/N/I/MI | Laboratorio Clínico | 10 | ¿Cómo califica la atención recibida por el servicio de Laboratorio Clínico? | Equivalencia semántica | Likert 5 → one-hot 5 columnas | Pregunta 6 contiene `laboratorio` | 1 seleccionado, resto vacío | Bajo | No |
| CP..CT | Imágenes Diagnosticas (rayos x, ultrasonido) | MS/S/N/I/MI | Imágenes Diagnósticas | 11 | ¿Cómo califica la atención recibida por el servicio de Imágenes Diagnósticas? | Coincidencia parcial | Likert 5 → one-hot 5 columnas; preservar equivalencia `imagenes` ↔ `Imágenes Diagnosticas (rayos x, ultrasonido)` | Pregunta 6 contiene `imagenes` | 1 seleccionado, resto vacío | Medio | Sí: confirmar que la amplitud de MSPAS incluye rayos x/ultrasonido como parte del mismo servicio UISAU |
| CU..CY | UISAU | MS/S/N/I/MI | UISAU | 12 | ¿Cómo califica la atención recibida por UISAU (Unidad de Información en Salud)? | Equivalencia semántica | Likert 5 → one-hot 5 columnas | Pregunta 6 contiene `uisau` | 1 seleccionado, resto vacío | Bajo | No |

## 7. Reglas condicionales

Este bloque no depende del servicio principal del hospital (`consulta_externa`, `emergencia`, `encamamiento`).

Sí depende de una respuesta anterior:

- Pregunta 6 (`checkbox`) habilita o deshabilita las preguntas 7-12.

Reglas contractuales derivadas:

- Si el servicio de apoyo no fue seleccionado en la pregunta 6, las 5 celdas del grupo MSPAS correspondiente deben quedar vacías.
- No se debe imputar `Neutral`, `No`, `0` ni ningún otro valor cuando la subpregunta no aplica.
- El bloque admite `No aplica` por omisión estructural: la subpregunta simplemente no se responde porque su dependencia no se cumple.

## 8. Brechas identificadas

### 8.1 Brecha de rango heredado

Existe una discrepancia entre dos fuentes internas:

- Fuentes contractuales CSV heredadas: `BU..CX`
- Alcance pendiente solicitado para MSPAS-5A: `BV..CY`

Impacto:

- Si MSPAS-4B cerró efectivamente en `AW..BU`, entonces MSPAS-5A debe arrancar en `BV`.
- Si la plantilla oficial considera `BU` como inicio de Psicología, el límite entre MSPAS-4B y MSPAS-5A quedó cortado a mitad de grupo Likert.

Conclusión contractual de esta fase:

- Se congela `BV..CY` como rango pendiente de MSPAS-5A.
- La discrepancia debe resolverse antes de implementar MSPAS-5B.

### 8.2 Brecha semántica menor

- MSPAS: `Imágenes Diagnosticas (rayos x, ultrasonido)`
- UISAU: `Imágenes Diagnósticas`

No es una contradicción funcional, pero sí requiere validación del Project Owner para confirmar que ambos términos cubren exactamente el mismo servicio operativo.

### 8.3 Falta de código estable

- No existe `codigo` estable de pregunta en el modelo.
- El contrato debe anclarse a `orden`, `categoria`, `tipo_respuesta`, `dependencia` y `texto_pregunta`.

## 9. Políticas contractuales propuestas

### 9.1 One-hot

- Valor seleccionado → `1`
- Valores no seleccionados → vacío

### 9.2 Respuesta ausente

- Si la subpregunta aplica y no trae respuesta, dejar las 5 columnas vacías y emitir warning.

### 9.3 Valor desconocido

- Si el valor no pertenece a la escala Likert de 5 opciones, dejar el grupo vacío y emitir warning.

### 9.4 Duplicados iguales

- Si hay duplicados con el mismo valor para la misma encuesta/pregunta, marcar una sola columna y emitir warning.

### 9.5 Duplicados conflictivos

- Si hay duplicados con valores distintos para la misma encuesta/pregunta, dejar el grupo vacío y emitir warning de conflicto.

### 9.6 No aplicable

- Cuando la dependencia de la pregunta no se cumple, dejar el grupo completo vacío.

### 9.7 Errores vs warnings

- Error: columna fuera de rango, estructura rota, split de bloque no resuelto, secuencia distinta a 5 columnas.
- Warning: respuesta faltante, valor desconocido, duplicado consistente, duplicado conflictivo.

## 10. Valores reales

Fuera de alcance por instrucción de esta fase.

- No se consultó base de datos.
- No se consultó producción.
- No se generaron estadísticas.

## 11. Pruebas propuestas para MSPAS-5B

1. Verificar que `BV..CY` conserve exactamente 6 grupos de 5 columnas.
2. Verificar que `CZ` siga siendo la primera columna del siguiente bloque.
3. Verificar la secuencia `MS/S/N/I/MI` en cada subgrupo.
4. Verificar que una respuesta válida marque exactamente una columna.
5. Verificar que un servicio no seleccionado en la pregunta 6 deje su grupo vacío.
6. Verificar que duplicados consistentes marquen una sola columna con warning.
7. Verificar que duplicados conflictivos dejen el grupo vacío con warning.
8. Verificar que valores desconocidos dejen el grupo vacío con warning.
9. Verificar que la implementación no modifique `A..BU`.
10. Verificar que la implementación no invada `CZ..`.

## 12. Alcance exacto de una futura MSPAS-5B

Implementación esperada, no ejecutada en esta fase:

- Resolver el bloque `BV..CY`
- Mapear preguntas UISAU `orden 7..12`
- Usar la pregunta `orden 6` solo como regla de aplicabilidad
- Mantener política `1/vacío`
- No tocar `A..BU`
- No tocar `CZ..FN`
- Resolver explícitamente la ambigüedad `BU..CX` vs `BV..CY` antes de codificar

## 13. Decisiones pendientes del Project Owner

1. Confirmar si el rango contractual aprobado para la siguiente fase debe ser `BV..CY` como continuación del trabajo pendiente, o `BU..CX` como bloque semántico completo de Psicología a UISAU.
2. Confirmar si `Imágenes Diagnosticas (rayos x, ultrasonido)` en MSPAS equivale completamente a `Imágenes Diagnósticas` en UISAU.
3. Confirmar que el contrato debe anclarse a `orden` y no a `id` de pregunta.

## 14. Estado final de la fase

- RANGO IDENTIFICADO: SÍ
- PREGUNTAS MAPEADAS: SÍ
- DATOS DISPONIBLES VERIFICADOS: NO
- BRECHAS IDENTIFICADAS: SÍ
- CONTRATO LISTO PARA REVISIÓN: SÍ
- LISTO PARA IMPLEMENTAR MSPAS-5B: NO# MSPAS Block 5 Mapping Proposal (Bloque que comienza en BV)

## 1. Rango exacto

### 1.1 Alcance solicitado para MSPAS-5A
- Columna inicial solicitada para esta fase: **BV**.

### 1.2 Hallazgo estructural en plantilla oficial
- La sección MSPAS en la que cae BV es: **TRATO Y ATENCIÓN EN LOS SERVICIOS DE APOYO**.
- En la plantilla, el tramo completo de esa sección para servicios de apoyo es:
  - **Inicio estructural real:** BV
  - **Fin estructural real:** CY
  - **Inicio del bloque siguiente:** CZ
- Frontera oficial aprobada entre bloques:
  - **Última columna MSPAS-4B:** BU
  - **Primera columna MSPAS-5:** BV
  - **Solapamiento:** no existe

### 1.3 Rango contractual operativo para esta fase (desde BV)
- **Rango operativo MSPAS-5A:** **BV:CY**
- **Cantidad de columnas en BV:CY:** 30
- **Observación crítica de frontera:** BU pertenece al bloque anterior (MSPAS-4B). MSPAS-5 inicia en BV y no debe invadir BU.

### 1.4 Merges del bloque

#### Merge principal (fila 1)
- Merge de sección real: **BV1:CY1** = `TRATO Y ATENCIÓN EN LOS SERVICIOS DE APOYO`
- En el rango técnico aprobado, se conserva el tramo completo: **BV1:CY1**.

#### Merges internos (fila 2)
- **BV2:BZ2** = `Psicología`
- **CA2:CE2** = `Nutrición`
- **CF2:CJ2** = `Trabajo Social`
- **CK2:CO2** = `Laboratorio Clínico`
- **CP2:CT2** = `Imágenes Diagnosticas (rayos x, ultrasonido)`
- **CU2:CY2** = `UISAU`

#### Inicio del bloque siguiente
- **CZ1:DN1** = `COMUNICACIÓN E INFORMACIÓN`
- Primera subpregunta siguiente:
  - **CZ2:DD2** = `Claridad de información sobre estado de salud`

## 2. Evidencia de plantilla

Fuentes auditadas en solo lectura:
- `backend/report-engine/mspas/mspas-header-template.xlsx` (plantilla aprobada)

Evidencia por celdas (filas 1, 2, 3):
- `BQ2:BU2` = `El personal le llamó por su nombre` (bloque anterior).
- `BQ3` = `MS`, `BR3` = `S`, `BS3` = `N`, `BT3` = `I`, `BU3` = `MI`.
- `BV1` contiene `TRATO Y ATENCIÓN EN LOS SERVICIOS DE APOYO`; merge `BV1:CY1`.
- `BV2` contiene `Psicología`; merge `BV2:BZ2`; `BV3` = `MS`, `BW3` = `S`, `BX3` = `N`, `BY3` = `I`, `BZ3` = `MI`.
- `CA2` contiene `Nutrición` y su escala ocupa `CA3..CE3` (MS/S/N/I/MI).
- `CZ1` cambia a `COMUNICACIÓN E INFORMACIÓN` (fin del bloque de apoyo en CY).

## 3. Encabezados literales MSPAS del bloque (desde BV)

### 3.1 Sección (fila 1)
- `TRATO Y ATENCIÓN EN LOS SERVICIOS DE APOYO`

### 3.2 Preguntas (fila 2) y secuencia de respuestas (fila 3)

1. Psicología (grupo completo BV:BZ)
- Tramo dentro de MSPAS-5A: **BV:BZ**
- Secuencia completa: **MS, S, N, I, MI**
- Tipo: **MS/S/N/I/MI** (one-hot Likert de 5 columnas)

2. Nutrición
- Rango: **CA:CE**
- Secuencia: **MS, S, N, I, MI**
- Tipo: **MS/S/N/I/MI**

3. Trabajo Social
- Rango: **CF:CJ**
- Secuencia: **MS, S, N, I, MI**
- Tipo: **MS/S/N/I/MI**

4. Laboratorio Clínico
- Rango: **CK:CO**
- Secuencia: **MS, S, N, I, MI**
- Tipo: **MS/S/N/I/MI**

5. Imágenes Diagnosticas (rayos x, ultrasonido)
- Rango: **CP:CT**
- Secuencia: **MS, S, N, I, MI**
- Tipo: **MS/S/N/I/MI**

6. UISAU
- Rango: **CU:CY**
- Secuencia: **MS, S, N, I, MI**
- Tipo: **MS/S/N/I/MI**

## 4. Inventario de preguntas UISAU candidatas (seeder + estructura encuesta activa)

Base: `backend/src/seeders/runSeed.js` y estructura de `GET /api/encuesta/activa`.

| ID esperado* | Código estable | Texto completo UISAU | Sección | Orden | Tipo | Opciones | Dependencia | Aplicabilidad |
|---|---|---|---|---:|---|---|---|---|
| 6 | N/A | ¿Cuáles de los siguientes servicios de apoyo recibió durante su visita? (Seleccione todos los que apliquen) | servicios_apoyo | 6 | checkbox | Psicología, Nutrición, Trabajo Social, Laboratorio Clínico, Imágenes Diagnósticas, UISAU | null | Siempre visible |
| 7 | N/A | ¿Cómo califica la atención recibida por el servicio de Psicología? | servicios_apoyo | 7 | likert_5 | Muy Satisfecho, Satisfecho, Neutral, Insatisfecho, Muy Insatisfecho | {"campo":"servicio_seleccionado","valor":"psicologia"} | Solo si se marcó Psicología |
| 8 | N/A | ¿Cómo califica la atención recibida por el servicio de Nutrición? | servicios_apoyo | 8 | likert_5 | Muy Satisfecho, Satisfecho, Neutral, Insatisfecho, Muy Insatisfecho | {"campo":"servicio_seleccionado","valor":"nutricion"} | Solo si se marcó Nutrición |
| 9 | N/A | ¿Cómo califica la atención recibida por el servicio de Trabajo Social? | servicios_apoyo | 9 | likert_5 | Muy Satisfecho, Satisfecho, Neutral, Insatisfecho, Muy Insatisfecho | {"campo":"servicio_seleccionado","valor":"trabajo_social"} | Solo si se marcó Trabajo Social |
| 10 | N/A | ¿Cómo califica la atención recibida por el servicio de Laboratorio Clínico? | servicios_apoyo | 10 | likert_5 | Muy Satisfecho, Satisfecho, Neutral, Insatisfecho, Muy Insatisfecho | {"campo":"servicio_seleccionado","valor":"laboratorio"} | Solo si se marcó Laboratorio Clínico |
| 11 | N/A | ¿Cómo califica la atención recibida por el servicio de Imágenes Diagnósticas? | servicios_apoyo | 11 | likert_5 | Muy Satisfecho, Satisfecho, Neutral, Insatisfecho, Muy Insatisfecho | {"campo":"servicio_seleccionado","valor":"imagenes"} | Solo si se marcó Imágenes Diagnósticas |
| 12 | N/A | ¿Cómo califica la atención recibida por UISAU (Unidad de Información en Salud)? | servicios_apoyo | 12 | likert_5 | Muy Satisfecho, Satisfecho, Neutral, Insatisfecho, Muy Insatisfecho | {"campo":"servicio_seleccionado","valor":"uisau"} | Solo si se marcó UISAU |

\* Nota: en el modelo actual no existe campo de código estable de pregunta; el identificador operativo estable observado es `orden` + `categoria` + `texto_pregunta`.

## 5. Matriz de correspondencia (MSPAS ↔ UISAU) para BV:CY

| Rango MSPAS | Encabezado MSPAS literal | Opciones de columna | Pregunta UISAU candidata | ID/código UISAU | Texto UISAU | Clasificación | Transformación requerida | Dependencia | Política histórica | Riesgo | Decisión PO |
|---|---|---|---|---|---|---|---|---|---|---|---|
| BV:BZ | TRATO Y ATENCIÓN EN LOS SERVICIOS DE APOYO \| Psicología \| MS/S/N/I/MI | MS,S,N,I,MI | Orden 7 (likert_5 Psicología) | ID esperado 7 / sin código | ¿Cómo califica la atención recibida por el servicio de Psicología? | Equivalencia semántica | one-hot Likert texto/opción -> columna MSPAS | servicio_seleccionado=psicologia | Preservar grupo one-hot completo | Medio | Aprobación |
| CA:CE | TRATO Y ATENCIÓN EN LOS SERVICIOS DE APOYO \| Nutrición \| MS/S/N/I/MI | MS,S,N,I,MI | Orden 8 | ID esperado 8 / sin código | ¿Cómo califica la atención recibida por el servicio de Nutrición? | Equivalencia semántica | one-hot Likert | servicio_seleccionado=nutricion | one-hot, vacíos si no aplica | Medio | Aprobación |
| CF:CJ | TRATO Y ATENCIÓN EN LOS SERVICIOS DE APOYO \| Trabajo Social \| MS/S/N/I/MI | MS,S,N,I,MI | Orden 9 | ID esperado 9 / sin código | ¿Cómo califica la atención recibida por el servicio de Trabajo Social? | Equivalencia semántica | one-hot Likert | servicio_seleccionado=trabajo_social | one-hot, vacíos si no aplica | Medio | Aprobación |
| CK:CO | TRATO Y ATENCIÓN EN LOS SERVICIOS DE APOYO \| Laboratorio Clínico \| MS/S/N/I/MI | MS,S,N,I,MI | Orden 10 | ID esperado 10 / sin código | ¿Cómo califica la atención recibida por el servicio de Laboratorio Clínico? | Equivalencia semántica | one-hot Likert | servicio_seleccionado=laboratorio | one-hot, vacíos si no aplica | Medio | Aprobación |
| CP:CT | TRATO Y ATENCIÓN EN LOS SERVICIOS DE APOYO \| Imágenes Diagnosticas (rayos x, ultrasonido) \| MS/S/N/I/MI | MS,S,N,I,MI | Orden 11 | ID esperado 11 / sin código | ¿Cómo califica la atención recibida por el servicio de Imágenes Diagnósticas? | Equivalencia semántica parcial (texto MSPAS más específico) | one-hot Likert | servicio_seleccionado=imagenes | one-hot, vacíos si no aplica | Medio | Confirmar equivalencia semántica final |
| CU:CY | TRATO Y ATENCIÓN EN LOS SERVICIOS DE APOYO \| UISAU \| MS/S/N/I/MI | MS,S,N,I,MI | Orden 12 | ID esperado 12 / sin código | ¿Cómo califica la atención recibida por UISAU (Unidad de Información en Salud)? | Equivalencia semántica | one-hot Likert | servicio_seleccionado=uisau | one-hot, vacíos si no aplica | Medio | Aprobación |

## 6. Valores reales

- **No incluido por instrucción del Project Owner para MSPAS-5A**.
- Esta fase contractual no incorpora estadísticas, conteos ni perfilamiento de datos históricos.

## 7. Reglas condicionales (expresas)

1. Este bloque **no** es exclusivo de Consulta Externa, Emergencia o Encamamiento.
2. Sí depende de respuesta anterior:
- La pregunta de selección múltiple de servicios (orden 6) habilita/deshabilita preguntas 7..12.
3. Si un servicio no fue seleccionado, su subpregunta no aplica.
4. En no aplica, la política propuesta es **dejar celdas vacías** (no convertir a Neutral, No o 0).
5. La fase no define imputación de respuestas.

## 8. Brechas identificadas

1. **Brecha de frontera contractual resuelta:** la frontera correcta es BU/BV; MSPAS-4B finaliza en BU y MSPAS-5 inicia en BV, sin solapamiento.
2. No se observa solapamiento real en plantilla entre MSPAS-4B y MSPAS-5 (frontera BU/BV).
3. Diferencia literal menor en Imágenes:
- MSPAS: `Imágenes Diagnosticas (rayos x, ultrasonido)`
- UISAU: `Imágenes Diagnósticas`
4. No hay código estable de pregunta en el modelo para trazabilidad larga (se usa orden/categoría/texto).

## 9. Decisiones pendientes del Project Owner

1. Confirmar frontera funcional de implementación futura:
- Opción A: respetar inicio histórico de fase en BV.
- Opción B: mantener BV como inicio técnico y respetar los grupos reales BV:BZ, CA:CE, CF:CJ, CK:CO, CP:CT, CU:CY.
2. Confirmar si equivalencias semánticas de servicios de apoyo quedan aprobadas como válidas para MSPAS.
3. Confirmar política definitiva para `no aplica`: celdas vacías en todo el subgrupo de 5 columnas.
4. Confirmar política para valores no mapeables en futura implementación:
- warning sin escritura, o error bloqueante.
5. Confirmar tratamiento de duplicados potenciales en futura MSPAS-5B:
- duplicado igual, duplicado conflictivo.

## 10. Pruebas propuestas (para MSPAS-5B, no ejecutadas en 5A)

1. Verificación de límites de escritura exactos del bloque aprobado.
2. Prueba one-hot por cada servicio aplicable (MS/S/N/I/MI).
3. Prueba de no-aplica: subgrupo completo vacío cuando el servicio no fue seleccionado.
4. Prueba de no afectación al bloque siguiente (inicio en CZ).
5. Prueba específica de frontera BV/BU para Psicología.

## 11. Alcance exacto de una futura MSPAS-5B

Incluye:
- Implementar únicamente las columnas y reglas aprobadas para el bloque MSPAS-5A.
- Aplicar one-hot con principio: seleccionado=1, no seleccionado=vacío.
- Respetar dependencias de aplicabilidad por servicio.

Excluye:
- Cambios en formulario, seeder, BD, infraestructura.
- Imputación de datos.
- Reescritura de bloques A:BU ya cerrados.

---

## Veredicto contractual MSPAS-5A

- RANGO IDENTIFICADO: **SÍ**
- PREGUNTAS MAPEADAS: **SÍ**
- DATOS DISPONIBLES VERIFICADOS: **N/A (no requerido en 5A por instrucción)**
- BRECHAS IDENTIFICADAS: **SÍ**
- CONTRATO LISTO PARA REVISIÓN: **SÍ**
- LISTO PARA IMPLEMENTAR MSPAS-5B: **NO**
