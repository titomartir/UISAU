# MSPAS_EXPORT_CONTRACT

Contrato funcional Contract-First para el archivo de salida MSPAS.

## Reglas Globales
- Hoja destino unica: BAse completa
- Orden y cardinalidad fija: columnas A..FN (170 columnas)
- Filas 1..4 se preservan como estructura de plantilla
- Filas de datos inician en fila 7 del generado de referencia
- One-hot: marcar 1 opcion y dejar 0/blank en el resto segun estrategia del bloque
- Celdas calculadas en plantilla: E4, H4, K4 (porcentajes)
- Validacion fuerte de catalogos y fallback controlado para valores no mapeados

## Inventario completo
- Total campos contractuales: 170
- Detalle completo en FINAL_EXPORT_CONTRACT.json

## Matriz funcional
- Ver MSPAS_MAPPING_MATRIX.csv