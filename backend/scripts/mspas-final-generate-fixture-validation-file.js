#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { generateAAvWorkbook } = require('../src/services/mspasExportService');

const OUT_DIR = process.env.MSPAS3_OUT_DIR
  ? path.resolve(process.env.MSPAS3_OUT_DIR)
  : path.resolve(__dirname, '../../tools/mspas3-output');

const SCALE_VALUES = {
  MS: 'Muy Satisfecho',
  S: 'Satisfecho',
  N: 'Neutral',
  I: 'Insatisfecho',
  MI: 'Muy Insatisfecho'
};

const Q_SPECS = [
  { questionId: 13, orden: 13, categoria: 'comunicacion', texto: 'estado de salud', cols: ['CZ', 'DA', 'DB', 'DC', 'DD'] },
  { questionId: 14, orden: 14, categoria: 'comunicacion', texto: 'idioma o lenguaje', cols: ['DE', 'DF', 'DG', 'DH', 'DI'] },
  { questionId: 15, orden: 15, categoria: 'comunicacion', texto: 'diagnostico y tratamiento', cols: ['DJ', 'DK', 'DL', 'DM', 'DN'] },
  { questionId: 16, orden: 16, categoria: 'tiempo_condiciones', texto: 'tiempo de espera', cols: ['DO', 'DP', 'DQ', 'DR', 'DS'] },
  { questionId: 17, orden: 17, categoria: 'tiempo_condiciones', texto: 'comodidad y mobiliario', cols: ['DT', 'DU', 'DV', 'DW', 'DX'] },
  { questionId: 18, orden: 18, categoria: 'tiempo_condiciones', texto: 'limpieza y el orden del area', cols: ['DY', 'DZ', 'EA', 'EB', 'EC'] },
  { questionId: 19, orden: 19, categoria: 'tiempo_condiciones', texto: 'limpieza de los servicios sanitarios', cols: ['ED', 'EE', 'EF', 'EG', 'EH'] },
  { questionId: 20, orden: 20, categoria: 'tiempo_condiciones', texto: 'ventilacion e iluminacion en el area de espera', cols: ['EI', 'EJ', 'EK', 'EL', 'EM'] },
  { questionId: 21, orden: 21, categoria: 'tiempo_condiciones', texto: 'ventilacion e iluminacion en el area donde fue atendido', cols: ['EN', 'EO', 'EP', 'EQ', 'ER'] },
  { questionId: 22, orden: 22, categoria: 'tiempo_condiciones', texto: 'privacidad y seguridad personal', cols: ['ES', 'ET', 'EU', 'EV', 'EW'] },
  { questionId: 25, orden: 25, categoria: 'encamamiento', texto: 'ropa de cama', appliesToService: 'encamamiento', cols: ['EX', 'EY', 'EZ', 'FA', 'FB'] },
  { questionId: 26, orden: 26, categoria: 'encamamiento', texto: 'alimentos proporcionados', appliesToService: 'encamamiento', cols: ['FC', 'FD', 'FE', 'FF', 'FG'] },
  { questionId: 27, orden: 27, categoria: 'satisfaccion_global', texto: 'nivel de satisfaccion', cols: ['FH', 'FI', 'FJ', 'FK', 'FL'] }
];

const RECOMMENDATION_SPEC = {
  questionId: 28,
  orden: 28,
  categoria: 'satisfaccion_global',
  texto: 'referiria el servicio',
  tipo_respuesta: 'seleccion_unica',
  cols: ['FM', 'FN', 'FO']
};

const SCALE_TO_INDEX = { MS: 0, S: 1, N: 2, I: 3, MI: 4 };
const COLUMNS_AFTER_FO = ['FP', 'FQ', 'FR'];

let detailId = 900000;
let rowId = 92000;

function preguntaMeta(spec) {
  return {
    id: spec.questionId,
    orden: spec.orden,
    categoria: spec.categoria,
    tipo_respuesta: spec.tipo_respuesta || 'likert_5',
    texto_pregunta: spec.texto
  };
}

function detalle(spec, valor) {
  detailId += 1;
  return {
    id: detailId,
    pregunta_id: spec.questionId,
    opcion_id: null,
    respuesta_texto: valor,
    opcion: valor ? { id: detailId + 1000, valor_texto: valor, puntaje: null } : null,
    Pregunta: preguntaMeta(spec)
  };
}

function baseRow(servicioCanonico = 'consulta_externa') {
  rowId += 1;
  return {
    id: rowId,
    created_at: '2026-08-05T10:00:00.000Z',
    hospital: 'Hospital Regional de Quiche',
    servicio: servicioCanonico,
    origen_etnico: 'Maya',
    sexo: 'Femenino',
    forma_aplicacion: 'digital',
    idioma_predominante: 'espanol',
    detalles: []
  };
}

function buildApplicableDefaults(servicioCanonico) {
  return Q_SPECS
    .filter((spec) => !spec.appliesToService || spec.appliesToService === servicioCanonico)
    .map((spec) => ({ spec, valor: SCALE_VALUES.MS }));
}

function buildRows() {
  const rows = [];

  for (const spec of Q_SPECS) {
    for (const scale of Object.keys(SCALE_VALUES)) {
      const servicio = spec.appliesToService || 'consulta_externa';
      const row = baseRow(servicio);

      for (const defaultAnswer of buildApplicableDefaults(servicio)) {
        const value = defaultAnswer.spec.questionId === spec.questionId ? SCALE_VALUES[scale] : defaultAnswer.valor;
        row.detalles.push(detalle(defaultAnswer.spec, value));
      }

      rows.push({
        kind: 'scale',
        questionId: spec.questionId,
        scale,
        servicio,
        row
      });
    }
  }

  // Ausente (pregunta aplicable)
  {
    const row = baseRow('consulta_externa');
    for (const d of buildApplicableDefaults('consulta_externa')) {
      if (d.spec.questionId !== 13) row.detalles.push(detalle(d.spec, d.valor));
    }
    rows.push({ kind: 'missing', questionId: 13, row });
  }

  // Desconocido
  {
    const row = baseRow('consulta_externa');
    for (const d of buildApplicableDefaults('consulta_externa')) {
      const v = d.spec.questionId === 14 ? 'Excelente' : d.valor;
      row.detalles.push(detalle(d.spec, v));
    }
    rows.push({ kind: 'unknown', questionId: 14, row });
  }

  // Duplicado consistente
  {
    const row = baseRow('consulta_externa');
    for (const d of buildApplicableDefaults('consulta_externa')) {
      row.detalles.push(detalle(d.spec, d.valor));
      if (d.spec.questionId === 15) row.detalles.push(detalle(d.spec, d.valor));
    }
    rows.push({ kind: 'dup_consistent', questionId: 15, row });
  }

  // Duplicado conflictivo
  {
    const row = baseRow('consulta_externa');
    for (const d of buildApplicableDefaults('consulta_externa')) {
      row.detalles.push(detalle(d.spec, d.valor));
      if (d.spec.questionId === 16) row.detalles.push(detalle(d.spec, SCALE_VALUES.MI));
    }
    rows.push({ kind: 'dup_conflict', questionId: 16, row });
  }

  // No aplica para encamamiento
  {
    const row = baseRow('consulta_externa');
    for (const d of buildApplicableDefaults('consulta_externa')) {
      row.detalles.push(detalle(d.spec, d.valor));
    }
    rows.push({ kind: 'no_aplica', questionId: 25, row });
  }

  for (const value of ['Sí', 'Neutral', 'No']) {
    const row = baseRow('consulta_externa');
    for (const d of buildApplicableDefaults('consulta_externa')) {
      row.detalles.push(detalle(d.spec, d.valor));
    }
    row.detalles.push(detalle(RECOMMENDATION_SPEC, value));
    rows.push({ kind: 'recommendation', value, row });
  }

  {
    const row = baseRow('consulta_externa');
    for (const d of buildApplicableDefaults('consulta_externa')) {
      row.detalles.push(detalle(d.spec, d.valor));
    }
    rows.push({ kind: 'recommendation_missing', row });
  }

  {
    const row = baseRow('consulta_externa');
    for (const d of buildApplicableDefaults('consulta_externa')) {
      row.detalles.push(detalle(d.spec, d.valor));
    }
    row.detalles.push(detalle(RECOMMENDATION_SPEC, 'Tal vez'));
    rows.push({ kind: 'recommendation_unknown', row });
  }

  {
    const row = baseRow('consulta_externa');
    for (const d of buildApplicableDefaults('consulta_externa')) {
      row.detalles.push(detalle(d.spec, d.valor));
    }
    row.detalles.push(detalle(RECOMMENDATION_SPEC, 'Sí'));
    row.detalles.push(detalle(RECOMMENDATION_SPEC, 'Sí'));
    rows.push({ kind: 'recommendation_dup_consistent', row });
  }

  {
    const row = baseRow('consulta_externa');
    for (const d of buildApplicableDefaults('consulta_externa')) {
      row.detalles.push(detalle(d.spec, d.valor));
    }
    row.detalles.push(detalle(RECOMMENDATION_SPEC, 'Sí'));
    row.detalles.push(detalle(RECOMMENDATION_SPEC, 'No'));
    rows.push({ kind: 'recommendation_dup_conflict', row });
  }

  return rows;
}

function getCell(ws, ref) {
  return ws[ref] ? ws[ref].v : undefined;
}

(function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const cases = buildRows();
  const exportRows = cases.map((c) => c.row);

  const result = generateAAvWorkbook(exportRows, '2026-08-05', '2026-08-05');
  const outPath = path.join(OUT_DIR, `fixture_final_${result.fileName}`);
  fs.writeFileSync(outPath, result.buffer);

  const wb = XLSX.readFile(outPath, { cellFormula: true });
  const ws = wb.Sheets[wb.SheetNames[0]];

  const failures = [];

  cases.forEach((entry, idx) => {
    const excelRow = 4 + idx;

    if (entry.kind === 'scale') {
      const spec = Q_SPECS.find((s) => s.questionId === entry.questionId);
      const expectedCol = spec.cols[SCALE_TO_INDEX[entry.scale]];
      const marks = spec.cols.filter((col) => getCell(ws, `${col}${excelRow}`) === 1);
      const zeros = spec.cols.filter((col) => getCell(ws, `${col}${excelRow}`) === 0);
      if (!(marks.length === 1 && marks[0] === expectedCol)) {
        failures.push(`Escala ${entry.scale} no coincide Q${entry.questionId} fila ${excelRow}`);
      }
      if (zeros.length > 0) {
        failures.push(`Se detectaron 0 en Q${entry.questionId} fila ${excelRow}`);
      }
    }

    if (entry.kind === 'missing') {
      const spec = Q_SPECS.find((s) => s.questionId === entry.questionId);
      const marks = spec.cols.filter((col) => getCell(ws, `${col}${excelRow}`) === 1);
      if (marks.length !== 0) failures.push(`Missing no vacio Q${entry.questionId} fila ${excelRow}`);
    }

    if (entry.kind === 'unknown') {
      const spec = Q_SPECS.find((s) => s.questionId === entry.questionId);
      const marks = spec.cols.filter((col) => getCell(ws, `${col}${excelRow}`) === 1);
      if (marks.length !== 0) failures.push(`Unknown no vacio Q${entry.questionId} fila ${excelRow}`);
    }

    if (entry.kind === 'dup_consistent') {
      const spec = Q_SPECS.find((s) => s.questionId === entry.questionId);
      const marks = spec.cols.filter((col) => getCell(ws, `${col}${excelRow}`) === 1);
      if (!(marks.length === 1 && marks[0] === spec.cols[0])) {
        failures.push(`Duplicado consistente no marcado Q${entry.questionId} fila ${excelRow}`);
      }
    }

    if (entry.kind === 'dup_conflict') {
      const spec = Q_SPECS.find((s) => s.questionId === entry.questionId);
      const marks = spec.cols.filter((col) => getCell(ws, `${col}${excelRow}`) === 1);
      if (marks.length !== 0) failures.push(`Duplicado conflictivo no vacio Q${entry.questionId} fila ${excelRow}`);
    }

    if (entry.kind === 'no_aplica') {
      const spec = Q_SPECS.find((s) => s.questionId === entry.questionId);
      const marks = spec.cols.filter((col) => getCell(ws, `${col}${excelRow}`) === 1);
      if (marks.length !== 0) failures.push(`No aplica no vacio Q${entry.questionId} fila ${excelRow}`);
    }

    if (entry.kind === 'recommendation') {
      const expectedCol = entry.value === 'Sí' ? 'FM' : entry.value === 'Neutral' ? 'FN' : 'FO';
      const marks = RECOMMENDATION_SPEC.cols.filter((col) => getCell(ws, `${col}${excelRow}`) === 1);
      const zeros = RECOMMENDATION_SPEC.cols.filter((col) => getCell(ws, `${col}${excelRow}`) === 0);
      if (!(marks.length === 1 && marks[0] === expectedCol)) {
        failures.push(`Recomendacion ${entry.value} no coincide fila ${excelRow}`);
      }
      if (zeros.length > 0) failures.push(`Se detectaron 0 en recomendacion fila ${excelRow}`);
    }

    if (entry.kind === 'recommendation_missing') {
      const marks = RECOMMENDATION_SPEC.cols.filter((col) => getCell(ws, `${col}${excelRow}`) === 1);
      if (marks.length !== 0) failures.push(`Recomendacion missing no vacia fila ${excelRow}`);
    }

    if (entry.kind === 'recommendation_unknown') {
      const marks = RECOMMENDATION_SPEC.cols.filter((col) => getCell(ws, `${col}${excelRow}`) === 1);
      if (marks.length !== 0) failures.push(`Recomendacion unknown no vacia fila ${excelRow}`);
    }

    if (entry.kind === 'recommendation_dup_consistent') {
      const marks = RECOMMENDATION_SPEC.cols.filter((col) => getCell(ws, `${col}${excelRow}`) === 1);
      if (!(marks.length === 1 && marks[0] === 'FM')) {
        failures.push(`Recomendacion dup consistente no marcada fila ${excelRow}`);
      }
    }

    if (entry.kind === 'recommendation_dup_conflict') {
      const marks = RECOMMENDATION_SPEC.cols.filter((col) => getCell(ws, `${col}${excelRow}`) === 1);
      if (marks.length !== 0) failures.push(`Recomendacion dup conflictiva no vacia fila ${excelRow}`);
    }

    for (const col of COLUMNS_AFTER_FO) {
      const v = getCell(ws, `${col}${excelRow}`);
      if (v !== undefined && v !== null && String(v).trim() !== '') {
        failures.push(`Columna posterior a FO con valor en ${col}${excelRow}`);
      }
    }
  });

  const summary = {
    outputPath: outPath,
    totalRows: exportRows.length,
    checks: {
      allCasesPass: failures.length === 0,
      postFoEmpty: !failures.some((f) => f.includes('posterior a FO'))
    },
    stats: {
      czfl: result.preview?.czflResumen || null,
      likertCzFl: result.preview?.likertCzFl || [],
      recommendation: result.preview?.fmFoResumen || null
    },
    warningSummary: result.warningSummary,
    failures
  };

  const summaryPath = path.join(OUT_DIR, 'mspas-final-fixture-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

  console.log(JSON.stringify(summary, null, 2));
})();
