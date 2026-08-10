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
  5: { id: 5, texto_pregunta: 'llamo por su nombre', categoria: 'trato_atencion', orden: 5, tipo_respuesta: 'likert_5' },
  6: { id: 6, texto_pregunta: 'cuales de los siguientes servicios de apoyo recibio', categoria: 'servicios_apoyo', orden: 6, tipo_respuesta: 'checkbox' },
  7: { id: 7, texto_pregunta: 'servicio de psicologia', categoria: 'servicios_apoyo', orden: 7, tipo_respuesta: 'likert_5' },
  8: { id: 8, texto_pregunta: 'servicio de nutricion', categoria: 'servicios_apoyo', orden: 8, tipo_respuesta: 'likert_5' },
  9: { id: 9, texto_pregunta: 'servicio de trabajo social', categoria: 'servicios_apoyo', orden: 9, tipo_respuesta: 'likert_5' },
  10: { id: 10, texto_pregunta: 'servicio de laboratorio clinico', categoria: 'servicios_apoyo', orden: 10, tipo_respuesta: 'likert_5' },
  11: { id: 11, texto_pregunta: 'servicio de imagenes diagnosticas', categoria: 'servicios_apoyo', orden: 11, tipo_respuesta: 'likert_5' },
  12: { id: 12, texto_pregunta: 'atencion recibida por uisau', categoria: 'servicios_apoyo', orden: 12, tipo_respuesta: 'likert_5' }
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
      detail(5, 5, 'Muy Insatisfecho'),
      detail(101, 6, 'Psicología'),
      detail(102, 7, 'Muy Satisfecho')
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
      detail(9, 5, 'Insatisfecho'),
      detail(103, 6, 'Nutrición'),
      detail(104, 8, 'Satisfecho')
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
      detail(14, 5, 'Muy Insatisfecho'),
      detail(105, 6, 'Trabajo Social'),
      detail(106, 9, 'Neutral')
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
      detail(20, 5, 'Muy Insatisfecho'),
      detail(107, 6, 'Laboratorio Clínico'),
      detail(108, 10, 'Insatisfecho')
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
      detail(25, 5, 'Insatisfecho'),
      detail(109, 6, 'Imágenes Diagnósticas'),
      detail(110, 11, 'Muy Insatisfecho')
    ]
  },
  {
    id: 91006,
    created_at: '2026-08-05T14:10:00.000Z',
    hospital: 'Hospital Regional de Quiche',
    servicio: 'consulta_externa',
    origen_etnico: 'Maya',
    sexo: 'Masculino',
    forma_aplicacion: 'digital',
    idioma_predominante: 'espanol',
    detalles: [
      detail(111, 6, 'UISAU')
    ]
  },
  {
    id: 91007,
    created_at: '2026-08-05T14:35:00.000Z',
    hospital: 'Hospital Regional de Quiche',
    servicio: 'emergencia',
    origen_etnico: 'Maya',
    sexo: 'Femenino',
    forma_aplicacion: 'impreso',
    idioma_predominante: 'espanol',
    detalles: []
  },
  {
    id: 91008,
    created_at: '2026-08-05T15:05:00.000Z',
    hospital: 'Hospital Regional de Quiche',
    servicio: 'encamamiento',
    origen_etnico: 'Ladino',
    sexo: 'Masculino',
    forma_aplicacion: 'digital',
    idioma_predominante: 'espanol',
    detalles: [
      detail(112, 6, 'Psicología'),
      detail(113, 7, 'Excelente')
    ]
  },
  {
    id: 91009,
    created_at: '2026-08-05T15:30:00.000Z',
    hospital: 'Hospital Regional de Quiche',
    servicio: 'consulta_externa',
    origen_etnico: 'Maya',
    sexo: 'Masculino',
    forma_aplicacion: 'impreso',
    idioma_predominante: 'espanol',
    detalles: [
      detail(114, 6, 'Nutrición'),
      detail(115, 8, 'Satisfecho'),
      detail(116, 8, 'Satisfecho')
    ]
  },
  {
    id: 91010,
    created_at: '2026-08-05T16:00:00.000Z',
    hospital: 'Hospital Regional de Quiche',
    servicio: 'emergencia',
    origen_etnico: 'Xinka',
    sexo: 'Femenino',
    forma_aplicacion: 'digital',
    idioma_predominante: 'espanol',
    detalles: [
      detail(117, 6, 'Trabajo Social'),
      detail(118, 9, 'Neutral'),
      detail(119, 9, 'Insatisfecho')
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
    supportPsicologiaMS: Boolean(ws.BV4 && ws.BV4.v === 1),
    supportNutricionS: Boolean(ws.CB5 && ws.CB5.v === 1),
    supportTrabajoN: Boolean(ws.CH6 && ws.CH6.v === 1),
    supportLaboratorioI: Boolean(ws.CN7 && ws.CN7.v === 1),
    supportImagenesMI: Boolean(ws.CT8 && ws.CT8.v === 1),
    supportUisauMissingEmpty: !ws.CU9 && !ws.CV9 && !ws.CW9 && !ws.CX9 && !ws.CY9,
    supportNoAplicaEmpty: !ws.BV10 && !ws.BW10 && !ws.BX10 && !ws.BY10 && !ws.BZ10,
    supportUnknownEmpty: !ws.BV11 && !ws.BW11 && !ws.BX11 && !ws.BY11 && !ws.BZ11,
    supportDupConsistentMarked: Boolean(ws.CB12 && ws.CB12.v === 1),
    supportDupConflictEmpty: !ws.CF13 && !ws.CG13 && !ws.CH13 && !ws.CI13 && !ws.CJ13,
    postCyEmpty: true
  };

  for (let r = 4; r <= 13; r += 1) {
    for (let c = XLSX.utils.decode_col('CZ'); c <= XLSX.utils.decode_col('FO'); c += 1) {
      const ref = `${XLSX.utils.encode_col(c)}${r}`;
      const v = ws[ref] ? ws[ref].v : undefined;
      if (v !== undefined && v !== null && String(v).trim() !== '') {
        checks.postCyEmpty = false;
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
      edgeCases: ['respuesta_ausente', 'valor_desconocido', 'duplicado_consistente', 'duplicado_conflictivo', 'no_aplica']
    },
    checks
  };

  const jsonPath = path.join(OUT_DIR, 'mspas3-fixture-summary.json');
  fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 2));

  console.log(JSON.stringify(summary, null, 2));
})();
