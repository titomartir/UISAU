#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const {
  generateAAvWorkbook
} = require('../src/services/mspasExportService');

const OUT_DIR = process.env.MSPAS3_OUT_DIR
  ? path.resolve(process.env.MSPAS3_OUT_DIR)
  : path.resolve(__dirname, '../../tools/mspas3-output');

const Q_META = {
  1: { id: 1, texto_pregunta: 'personal medico', categoria: 'trato_atencion', orden: 1, tipo_respuesta: 'likert_5' },
  2: { id: 2, texto_pregunta: 'personal de enfermeria', categoria: 'trato_atencion', orden: 2, tipo_respuesta: 'likert_5' },
  3: { id: 3, texto_pregunta: 'recepcion o admision', categoria: 'trato_atencion', orden: 3, tipo_respuesta: 'likert_5' },
  4: { id: 4, texto_pregunta: 'cortesia y respeto', categoria: 'trato_atencion', orden: 4, tipo_respuesta: 'likert_5' },
  5: { id: 5, texto_pregunta: 'llamo por su nombre', categoria: 'trato_atencion', orden: 5, tipo_respuesta: 'likert_5' }
};

function detail(id, preguntaId, valor) {
  return {
    id,
    pregunta_id: preguntaId,
    opcion_id: null,
    respuesta_texto: valor,
    opcion: valor ? { id: 1000 + id, valor_texto: valor, puntaje: null } : null,
    Pregunta: Q_META[preguntaId]
  };
}

const FIXTURE_ROWS = [
  {
    id: 91001,
    created_at: '2026-08-05T08:15:00.000Z',
    hospital: 'Hospital Regional de El Quiche',
    servicio: 'consulta_externa',
    origen_etnico: 'Maya',
    sexo: 'Masculino',
    forma_aplicacion: 'impreso',
    idioma_predominante: 'kiche',
    detalles: [
      detail(1, 1, 'Muy Satisfecho'),
      detail(2, 2, 'Satisfecho'),
      detail(3, 3, 'Neutral'),
      detail(4, 4, 'Insatisfecho'),
      detail(5, 5, 'Muy Insatisfecho')
    ]
  },
  {
    id: 91002,
    created_at: '2026-08-05T09:20:00.000Z',
    hospital: 'Hospital Regional de El Quiche',
    servicio: 'emergencia',
    origen_etnico: 'Ladino',
    sexo: 'Femenino',
    forma_aplicacion: 'digital',
    idioma_predominante: 'espanol',
    detalles: [
      detail(6, 1, 'Satisfecho'),
      detail(7, 2, 'Muy Satisfecho'),
      detail(8, 4, 'Neutral'),
      detail(9, 5, 'Insatisfecho')
    ]
  },
  {
    id: 91003,
    created_at: '2026-08-05T11:10:00.000Z',
    hospital: 'Hospital Regional de Quiche',
    servicio: 'encamamiento',
    origen_etnico: 'Garifuna',
    sexo: 'Otro',
    forma_aplicacion: 'digital',
    idioma_predominante: 'garifuna',
    detalles: [
      detail(10, 1, 'Muy Satisfecho'),
      detail(11, 2, 'Bueno'),
      detail(12, 3, 'Neutral'),
      detail(13, 4, 'Insatisfecho'),
      detail(14, 5, 'Muy Insatisfecho')
    ]
  },
  {
    id: 91004,
    created_at: '2026-08-05T12:35:00.000Z',
    hospital: 'Hospital Regional de Quiche',
    servicio: 'emergencia',
    origen_etnico: 'Xinka',
    sexo: 'Masculino',
    forma_aplicacion: 'impreso',
    idioma_predominante: 'qeqchi',
    detalles: [
      detail(15, 1, 'Muy Satisfecho'),
      detail(16, 2, 'Satisfecho'),
      detail(17, 3, 'Neutral'),
      detail(18, 4, 'Satisfecho'),
      detail(19, 4, 'Satisfecho'),
      detail(20, 5, 'Muy Insatisfecho')
    ]
  },
  {
    id: 91005,
    created_at: '2026-08-05T13:45:00.000Z',
    hospital: 'Hospital Regional de Quiche',
    servicio: 'consulta_externa',
    origen_etnico: 'Maya',
    sexo: 'Femenino',
    forma_aplicacion: 'impreso',
    idioma_predominante: 'espanol',
    detalles: [
      detail(21, 1, 'Muy Satisfecho'),
      detail(22, 2, 'Satisfecho'),
      detail(23, 3, 'Neutral'),
      detail(24, 5, 'Neutral'),
      detail(25, 5, 'Insatisfecho')
    ]
  }
];

(function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const fechaInicio = '2026-08-05';
  const fechaFin = '2026-08-05';

  const result = generateAAvWorkbook(FIXTURE_ROWS, fechaInicio, fechaFin);
  const outPath = path.join(OUT_DIR, `fixture_${result.fileName}`);
  fs.writeFileSync(outPath, result.buffer);

  const wb = XLSX.readFile(outPath, { cellFormula: true });
  const ws = wb.Sheets[wb.SheetNames[0]];

  const checks = {
    coversScaleMS: Boolean(ws.AW4 && ws.AW4.v === 1),
    coversScaleS: Boolean(ws.BC4 && ws.BC4.v === 1),
    coversScaleN: Boolean(ws.BI4 && ws.BI4.v === 1),
    coversScaleI: Boolean(ws.BO4 && ws.BO4.v === 1),
    coversScaleMI: Boolean(ws.BU4 && ws.BU4.v === 1),
    missingLeavesEmpty: !ws.BI5 && !ws.BG5 && !ws.BH5 && !ws.BJ5 && !ws.BK5,
    unknownLeavesEmpty: !ws.BB6 && !ws.BC6 && !ws.BD6 && !ws.BE6 && !ws.BF6,
    dupConsistentMarked: Boolean(ws.BM7 && ws.BM7.v === 1),
    dupConflictEmpty: !ws.BQ8 && !ws.BR8 && !ws.BS8 && !ws.BT8 && !ws.BU8,
    postBuEmpty: true
  };

  for (let r = 4; r <= 8; r += 1) {
    for (let c = XLSX.utils.decode_col('BV'); c <= XLSX.utils.decode_col('FO'); c += 1) {
      const ref = `${XLSX.utils.encode_col(c)}${r}`;
      const v = ws[ref] ? ws[ref].v : undefined;
      if (v !== undefined && v !== null && String(v).trim() !== '') {
        checks.postBuEmpty = false;
        break;
      }
    }
  }

  const summary = {
    outputPath: outPath,
    period: { fechaInicio, fechaFin },
    counts: result.counts,
    warnings: result.warningSummary,
    totalRows: FIXTURE_ROWS.length,
    coverage: {
      servicios: ['consulta_externa', 'emergencia', 'encamamiento'],
      idiomas: ['kiche', 'espanol', 'garifuna', 'qeqchi'],
      etnicos: ['Maya', 'Ladino', 'Garifuna', 'Xinka'],
      sexos: ['Masculino', 'Femenino', 'Otro'],
      formas: ['impreso', 'digital'],
      likert: ['MS', 'S', 'N', 'I', 'MI'],
      edgeCases: ['respuesta_ausente', 'valor_desconocido', 'duplicado_consistente', 'duplicado_conflictivo']
    },
    checks
  };

  const jsonPath = path.join(OUT_DIR, 'mspas3-fixture-summary.json');
  fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 2));

  console.log(JSON.stringify(summary, null, 2));
})();
