# MSPAS Block 4 Mapping Proposal (Post-AV)

## 1. Rango exacto del bloque posterior a AV

- Plantilla oficial auditada: `backend/report-engine/mspas/mspas-header-template.xlsx`
- Última columna de MSPAS-3 aprobada: `AV`
- Primera columna del siguiente bloque funcional de satisfacción: `AW`
- Última columna del bloque funcional inmediato posterior: `BU`
- Cantidad de columnas del bloque: 25
- Estructura por pregunta: 5 columnas por pregunta (MS, S, N, I, MI)
- Cantidad de preguntas incluidas: 5

### Evidencia de plantilla (sin suposiciones)

1. Merge de sección: `AW1:BU1` con texto `TRATO Y ATENCIÓN RECIBIDA`.
2. Subbloques de 5 columnas en fila 2:
   - `AW2:BA2` = `Personal Médico`
   - `BB2:BF2` = `Personal de enfermería`
   - `BG2:BK2` = `Personal de recepción/admisión`
   - `BL2:BP2` = `Cortesía y respeto durante la atención`
   - `BQ2:BU2` = `El personal le llamó por su nombre`
3. La siguiente sección inicia en `BV1` (`TRATO Y ATENCIÓN EN LOS SERVICIOS DE APOYO`).

Conclusión contractual: el primer bloque funcional posterior a `AV` termina exactamente en `BU`.

## 2. Referencia de encabezado (texto exacto MSPAS)

- Sección (fila 1): `TRATO Y ATENCIÓN RECIBIDA`
- Preguntas (fila 2):
  - `Personal Médico`
  - `Personal de enfermería`
  - `Personal de recepción/admisión`
  - `Cortesía y respeto durante la atención`
  - `El personal le llamó por su nombre`
- Escala (fila 3, repetida por cada grupo de 5): `MS`, `S`, `N`, `I`, `MI`

## 3. Inventario de preguntas UISAU candidatas (encuesta activa real)

Fuente: endpoint `GET /api/encuesta/activa` (encuesta activa ID 1).

| ID | Orden | Sección | Tipo | Texto UISAU | Dependencia | Requerido |
|---|---:|---|---|---|---|---|
| 1 | 1 | trato_atencion | likert_5 | ¿Cómo califica el trato y la atención recibida por el personal médico durante su visita? | null | true |
| 2 | 2 | trato_atencion | likert_5 | ¿Cómo califica el trato recibido por el personal de enfermería? | null | true |
| 3 | 3 | trato_atencion | likert_5 | ¿Cómo califica la atención brindada en el área de recepción o admisión del hospital? | null | true |
| 4 | 4 | trato_atencion | likert_5 | ¿Fue tratado con cortesía, respeto y dignidad por el personal del hospital? | null | true |
| 5 | 5 | trato_atencion | likert_5 | ¿El personal del hospital lo llamó por su nombre durante la atención? | null | true |

Opciones activas para las 5 preguntas (Likert oficial UISAU):
- Muy Satisfecho
- Satisfecho
- Neutral
- Insatisfecho
- Muy Insatisfecho

## 4. Matriz de correspondencia contractual (MSPAS ↔ UISAU)

Regla de coincidencia usada:
- exacta: texto/significado iguales.
- equivalente: significado coincide, redacción distinta.
- parcial: cubre solo parte del significado.
- sin fuente: no existe pregunta fuente en UISAU.

| Rango MSPAS | Encabezado MSPAS | Pregunta UISAU candidata | ID UISAU | Coincidencia | Transformación requerida | Regla one-hot | Histórico | Dependencia | Riesgo | Decisión pendiente PO |
|---|---|---|---:|---|---|---|---|---|---|---|
| AW-BA | Personal Médico | ¿Cómo califica el trato y la atención recibida por el personal médico durante su visita? | 1 | equivalente | mapear Likert texto a MS/S/N/I/MI | Una sola marca 1 en AW..BA; otras 4 vacías | sin respuesta => 5 vacías | null | bajo | confirmar criterio de desempate si hubiera doble marca inválida |
| BB-BF | Personal de enfermería | ¿Cómo califica el trato recibido por el personal de enfermería? | 2 | equivalente | mapear Likert texto a MS/S/N/I/MI | Una sola marca 1 en BB..BF; otras 4 vacías | sin respuesta => 5 vacías | null | bajo | confirmar política ante valor fuera de catálogo |
| BG-BK | Personal de recepción/admisión | ¿Cómo califica la atención brindada en el área de recepción o admisión del hospital? | 3 | equivalente | mapear Likert texto a MS/S/N/I/MI | Una sola marca 1 en BG..BK; otras 4 vacías | sin respuesta => 5 vacías | null | bajo | confirmar normalización de variantes de texto |
| BL-BP | Cortesía y respeto durante la atención | ¿Fue tratado con cortesía, respeto y dignidad por el personal del hospital? | 4 | equivalente | mapear Likert texto a MS/S/N/I/MI | Una sola marca 1 en BL..BP; otras 4 vacías | sin respuesta => 5 vacías | null | medio | confirmar si “dignidad” se considera semánticamente incluida en MSPAS |
| BQ-BU | El personal le llamó por su nombre | ¿El personal del hospital lo llamó por su nombre durante la atención? | 5 | equivalente | mapear Likert texto a MS/S/N/I/MI | Una sola marca 1 en BQ..BU; otras 4 vacías | sin respuesta => 5 vacías | null | bajo | confirmar literal de encabezado vs texto de pregunta |

### Regla one-hot documentada (solo contrato, no implementación)

Para cada pregunta del bloque (`5` columnas):
- MS = Muy satisfecho
- S = Satisfecho
- N = Neutral o indiferente
- I = Insatisfecho
- MI = Muy insatisfecho

Regla:
- exactamente una columna con `1` cuando existe respuesta válida;
- las otras cuatro vacías;
- nunca escribir `0`;
- nunca marcar más de una;
- si no hay respuesta histórica, las cinco vacías.

## 5. Brechas identificadas (solo documentación)

### 5.1 Preguntas MSPAS de este bloque sin fuente UISAU
- Ninguna en `AW:BU`.

### 5.2 Preguntas UISAU sin columna en este bloque
- Todas las que no pertenecen a `trato_atencion` orden 1..5 (28 preguntas restantes) quedan fuera de alcance de MSPAS-4A.

### 5.3 Diferencias de redacción
- Existen diferencias de literal entre encabezado MSPAS y texto de pregunta UISAU, pero el significado es equivalente en los 5 casos.

### 5.4 Diferencias de escala / valores incompatibles
- MSPAS usa abreviaturas `MS/S/N/I/MI` por columna.
- UISAU almacena Likert por opción textual (y `opcion_id`).
- Requiere transformación controlada texto/opción -> columna abreviada.

### 5.5 Preguntas condicionales / No aplica
- En este bloque no hay dependencias condicionales (`dependencia = null` en las 5).
- No existe opción explícita `No aplica` para estas 5 preguntas.

## 6. Datos reales disponibles (sin PII)

Fuente: `GET /api/admin/respuestas` + `GET /api/admin/respuestas/:id` (solo agregados).
Total respuestas administrativas auditadas: 15.

| ID UISAU | Respuestas existentes | Valores distintos observados (opción) | Nulos | Desconocidos | Estructuras objeto/json en texto |
|---:|---:|---|---:|---:|---:|
| 1 | 9 | Muy Satisfecho, Satisfecho, Insatisfecho | 0 | 0 | 0 |
| 2 | 8 | Muy Satisfecho, Neutral | 0 | 0 | 0 |
| 3 | 8 | Muy Satisfecho, Neutral, Insatisfecho | 0 | 0 | 0 |
| 4 | 9 | Muy Satisfecho, Satisfecho, Neutral, Muy Insatisfecho | 0 | 0 | 0 |
| 5 | 9 | Muy Satisfecho, Insatisfecho, Muy Insatisfecho | 0 | 0 | 0 |

Observación:
- Para estas 5 preguntas, el valor útil real está en `opcion.valor_texto` (no en `respuesta_texto`).

## 7. Contrato propuesto para MSPAS-4B (aún sin implementar)

### 7.1 Nombre del bloque
- Bloque post-AV #1: `TRATO Y ATENCIÓN RECIBIDA`.

### 7.2 Rango
- `AW:BU`.

### 7.3 Lista de preguntas incluidas
- 5 preguntas UISAU (`id` 1..5, `orden` 1..5, sección `trato_atencion`).

### 7.4 Mapeo UISAU -> MSPAS
- Q1 -> AW:BA
- Q2 -> BB:BF
- Q3 -> BG:BK
- Q4 -> BL:BP
- Q5 -> BQ:BU

### 7.5 Transformación
- Entrada válida: `opcion_id`/`opcion.valor_texto` de catálogo Likert.
- Conversión:
  - Muy Satisfecho -> MS
  - Satisfecho -> S
  - Neutral -> N
  - Insatisfecho -> I
  - Muy Insatisfecho -> MI
- Escritura: un `1` en la columna destino; resto vacío.

### 7.6 Validaciones
- No tocar columnas `A:AV`.
- No tocar fórmulas `E/H/K`.
- No escribir fuera de `AW:BU` en esta fase de implementación futura.
- Verificar merge/encabezado intacto en filas 1..3.
- Rechazar o reportar valores fuera de catálogo Likert.

### 7.7 Política de vacíos
- Sin detalle de respuesta para la pregunta: 5 columnas vacías.
- Detalle presente pero sin opción válida: 5 columnas vacías + warning técnico.

### 7.8 Política de desconocidos
- Valor no mapeable a Likert oficial: no escribir `1` en ninguna columna del bloque y emitir warning.

### 7.9 Dependencias
- Ninguna (preguntas no condicionales).

### 7.10 Casos límite
- Respuesta duplicada para una misma pregunta y encabezado.
- Respuesta con `opcion_id` nulo pero `respuesta_texto` no estándar.
- Registro histórico sin detalle de una o más de estas preguntas.

## 8. Propuesta de pruebas para MSPAS-4B

1. Caso feliz por cada pregunta (MS, S, N, I, MI) con one-hot correcto.
2. Registro con respuesta ausente en una pregunta -> 5 vacías para ese grupo.
3. Valor desconocido -> 5 vacías + warning.
4. Verificación de no afectación a `A:AV`.
5. Verificación de no afectación de fórmulas `E/H/K`.
6. Verificación de límites exactos `AW:BU` (sin escrituras en `BV+`).
7. Prueba de consistencia de encabezados/merges en filas 1..3.
8. Regresión MSPAS-3 (conteos y export A-AV inmutables).

## 9. Decisiones pendientes del Project Owner

1. Confirmar si las 5 coincidencias se aprueban como `equivalente` (ninguna marcada como `exacta`).
2. Definir política final para valores fuera de catálogo Likert: solo warning vs error bloqueante.
3. Confirmar manejo de posibles duplicados por pregunta en un mismo encabezado (prioridad por última respuesta o error).
4. Confirmar si la falta de respuesta histórica debe quedar siempre vacía (propuesto) sin imputación.

## 10. Estado de esta fase (MSPAS-4A)

- Documento contractual generado: sí.
- Implementación de código: no.
- Cambios sobre bloque A-AV: no.
- Cambios sobre fórmulas E/H/K: no.
- Cambios en BD/seeds/infraestructura: no.
