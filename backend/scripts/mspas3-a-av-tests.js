#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const XLSX = require('xlsx');
const { generateAAvWorkbook } = require('../src/services/mspasExportService');

const BASE_URL = process.env.MSPAS3_BASE_URL || 'http://127.0.0.1:15000/api';
const OUT_DIR = process.env.MSPAS3_OUT_DIR
  ? path.resolve(process.env.MSPAS3_OUT_DIR)
  : path.resolve(__dirname, '../../tools/mspas3-output');
const TEMPLATE_PATH = path.resolve(__dirname, '../report-engine/mspas/mspas-header-template.xlsx');

const HOSPITAL_VARIANTS = new Set([
  'hospital regional de quiche',
  'hospital regional de el quiche'
]);

const LIKERT_SPECS = [
  { questionId: 1, cols: ['AW', 'AX', 'AY', 'AZ', 'BA'] },
  { questionId: 2, cols: ['BB', 'BC', 'BD', 'BE', 'BF'] },
  { questionId: 3, cols: ['BG', 'BH', 'BI', 'BJ', 'BK'] },
  { questionId: 4, cols: ['BL', 'BM', 'BN', 'BO', 'BP'] },
  { questionId: 5, cols: ['BQ', 'BR', 'BS', 'BT', 'BU'] }
];

const SUPPORT_SPECS = [
  { serviceKey: 'psicologia', questionId: 7, cols: ['BV', 'BW', 'BX', 'BY', 'BZ'] },
  { serviceKey: 'nutricion', questionId: 8, cols: ['CA', 'CB', 'CC', 'CD', 'CE'] },
  { serviceKey: 'trabajo_social', questionId: 9, cols: ['CF', 'CG', 'CH', 'CI', 'CJ'] },
  { serviceKey: 'laboratorio', questionId: 10, cols: ['CK', 'CL', 'CM', 'CN', 'CO'] },
  { serviceKey: 'imagenes', questionId: 11, cols: ['CP', 'CQ', 'CR', 'CS', 'CT'] },
  { serviceKey: 'uisau', questionId: 12, cols: ['CU', 'CV', 'CW', 'CX', 'CY'] }
];

const FINAL_SPECS = [
  { questionId: 13, cols: ['CZ', 'DA', 'DB', 'DC', 'DD'] },
  { questionId: 14, cols: ['DE', 'DF', 'DG', 'DH', 'DI'] },
  { questionId: 15, cols: ['DJ', 'DK', 'DL', 'DM', 'DN'] },
  { questionId: 16, cols: ['DO', 'DP', 'DQ', 'DR', 'DS'] },
  { questionId: 17, cols: ['DT', 'DU', 'DV', 'DW', 'DX'] },
  { questionId: 18, cols: ['DY', 'DZ', 'EA', 'EB', 'EC'] },
  { questionId: 19, cols: ['ED', 'EE', 'EF', 'EG', 'EH'] },
  { questionId: 20, cols: ['EI', 'EJ', 'EK', 'EL', 'EM'] },
  { questionId: 21, cols: ['EN', 'EO', 'EP', 'EQ', 'ER'] },
  { questionId: 22, cols: ['ES', 'ET', 'EU', 'EV', 'EW'] },
  { questionId: 25, cols: ['EX', 'EY', 'EZ', 'FA', 'FB'], appliesToService: 'encamamiento' },
  { questionId: 26, cols: ['FC', 'FD', 'FE', 'FF', 'FG'], appliesToService: 'encamamiento' },
  { questionId: 27, cols: ['FH', 'FI', 'FJ', 'FK', 'FL'] }
];

const RECOMMENDATION_SPEC = {
  questionId: 28,
  orden: 28,
  categoria: 'satisfaccion_global',
  texto: 'referiria el servicio',
  tipo_respuesta: 'seleccion_unica',
  cols: ['FM', 'FN', 'FO']
};

const SUPPORT_OPTION_TO_KEY = {
  psicologia: 'psicologia',
  nutricion: 'nutricion',
  'trabajo social': 'trabajo_social',
  'laboratorio clinico': 'laboratorio',
  'imagenes diagnosticas': 'imagenes',
  uisau: 'uisau'
};

const SCALE_TO_INDEX = {
  MS: 0,
  S: 1,
  N: 2,
  I: 3,
  MI: 4
};

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

  {
    const row = baseRow('consulta_externa');
    for (const d of buildApplicableDefaults('consulta_externa')) {
      if (d.spec.questionId !== 13) row.detalles.push(detalle(d.spec, d.valor));
    }
    rows.push({ kind: 'missing', questionId: 13, row });
  }

  {
    const row = baseRow('consulta_externa');
    for (const d of buildApplicableDefaults('consulta_externa')) {
      const v = d.spec.questionId === 14 ? 'Excelente' : d.valor;
      row.detalles.push(detalle(d.spec, v));
    }
    rows.push({ kind: 'unknown', questionId: 14, row });
  }

  {
    const row = baseRow('consulta_externa');
    for (const d of buildApplicableDefaults('consulta_externa')) {
      row.detalles.push(detalle(d.spec, d.valor));
      if (d.spec.questionId === 15) row.detalles.push(detalle(d.spec, d.valor));
    }
    rows.push({ kind: 'dup_consistent', questionId: 15, row });
  }

  {
    const row = baseRow('consulta_externa');
    for (const d of buildApplicableDefaults('consulta_externa')) {
      row.detalles.push(detalle(d.spec, d.valor));
      if (d.spec.questionId === 16) row.detalles.push(detalle(d.spec, SCALE_VALUES.MI));
    }
    rows.push({ kind: 'dup_conflict', questionId: 16, row });
  }

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

function readEnvValue(filePath, key) {
  const content = fs.readFileSync(filePath, 'utf8');
  const line = content.split(/\r?\n/).find((l) => l.startsWith(`${key}=`));
  if (!line) return null;
  return line.slice(key.length + 1).trim();
}

function norm(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’'`]/g, '')
    .replace(/[^a-z0-9\s_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function gtDateIso(dateLike) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Guatemala',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(dateLike));
}

function isInGuatemalaDateRange(dateLike, startIso, endIso) {
  const d = gtDateIso(dateLike);
  return d >= startIso && d <= endIso;
}

function normalizeServicio(value) {
  const n = norm(value);
  if (n === 'consulta externa' || n === 'consulta_externa' || n === 'coex') return 'consulta_externa';
  if (n === 'emergencia') return 'emergencia';
  if (n === 'encamamiento') return 'encamamiento';
  return null;
}

function mapForma(raw) {
  const n = norm(raw);
  if (!n) return '';
  if (n === 'impreso') return 'Impreso';
  if (n === 'digital') return 'Digital';
  return '';
}

function mapEtnicoCol(raw) {
  const n = norm(raw);
  if (n === 'maya') return 'M';
  if (n === 'xinca' || n === 'xinka') return 'N';
  if (n === 'garifuna') return 'O';
  if (n === 'ladino' || n === 'mestizo' || n === 'mestizo ladino') return 'P';
  return null;
}

function mapIdiomaCol(raw) {
  const n = norm(raw);
  const map = {
    achi: 'Q',
    akateko: 'R',
    awakateco: 'S',
    chalchiteko: 'T',
    chorti: 'U',
    chuj: 'V',
    itza: 'W',
    ixil: 'X',
    jakalteko: 'Y',
    kaqchikel: 'Z',
    kiche: 'AA',
    mam: 'AB',
    mopan: 'AC',
    pocomam: 'AD',
    poqomchi: 'AE',
    qanjobal: 'AF',
    qeqchi: 'AG',
    sakapulteco: 'AH',
    sipakapense: 'AI',
    tektiteko: 'AJ',
    tzutujil: 'AK',
    uspanteko: 'AL',
    xinca: 'AM',
    garifuna: 'AN',
    espanol: 'AO',
    otros: 'AP'
  };
  return map[n] || null;
}

function mapSexoCol(raw) {
  const n = norm(raw);
  if (n === 'masculino' || n === 'hombre') return 'AQ';
  if (n === 'femenino' || n === 'mujer') return 'AR';
  if (n === 'otro') return 'AS';
  return null;
}

function mapServicioCol(raw) {
  const s = normalizeServicio(raw);
  if (s === 'consulta_externa') return 'AT';
  if (s === 'emergencia') return 'AU';
  if (s === 'encamamiento') return 'AV';
  return null;
}

function mapLikertScale(raw) {
  const n = norm(raw);
  if (!n) return null;
  if (n === 'muy satisfecho') return 'MS';
  if (n === 'satisfecho') return 'S';
  if (n === 'neutral' || n === 'neutral o indiferente' || n === 'indiferente') return 'N';
  if (n === 'insatisfecho') return 'I';
  if (n === 'muy insatisfecho') return 'MI';
  return null;
}

function mapRecommendationCol(raw) {
  const n = norm(raw);
  if (n === 'si') return 'FM';
  if (n === 'neutral') return 'FN';
  if (n === 'no') return 'FO';
  return null;
}

function getCell(ws, ref) {
  const c = ws[ref];
  return c ? c.v : undefined;
}

function getFormula(ws, ref) {
  const c = ws[ref];
  return c ? c.f : undefined;
}

function assert(cond, msg, bucket) {
  if (!cond) bucket.push(msg);
}

function getLikertExpectedForQuestion(detalles, questionId) {
  const items = (detalles || []).filter((d) => Number(d.pregunta_id) === questionId);

  if (items.length === 0) {
    return { status: 'missing', scale: null };
  }

  const normalized = items
    .map((d) => {
      const raw = d?.opcion?.valor_texto || d?.respuesta_texto || '';
      return {
        raw,
        normalized: norm(raw),
        scale: mapLikertScale(raw)
      };
    })
    .filter((x) => x.normalized);

  if (normalized.length === 0) {
    return { status: 'missing', scale: null };
  }

  if (normalized.length > 1) {
    const unique = new Set(normalized.map((x) => x.normalized));
    if (unique.size > 1) {
      return { status: 'dup_conflict', scale: null };
    }

    if (!normalized[0].scale) {
      return { status: 'unknown', scale: null };
    }

    return { status: 'dup_consistent', scale: normalized[0].scale };
  }

  if (!normalized[0].scale) {
    return { status: 'unknown', scale: null };
  }

  return { status: 'ok', scale: normalized[0].scale };
}

function getSelectedSupportServices(detalles) {
  const set = new Set();
  (detalles || [])
    .filter((d) => Number(d.pregunta_id) === 6)
    .forEach((d) => {
      const raw = d?.opcion?.valor_texto || d?.respuesta_texto || '';
      const key = SUPPORT_OPTION_TO_KEY[norm(raw)] || null;
      if (key) set.add(key);
    });
  return set;
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const root = path.resolve(__dirname, '../..');
  const envPath = path.join(root, '.env.production');
  const jwtSecret = readEnvValue(envPath, 'JWT_SECRET');
  if (!jwtSecret) throw new Error('No se encontro JWT_SECRET en .env.production');

  const token = jwt.sign({ id: 1, email: 'admin@local.test', rol: 'admin' }, jwtSecret, { expiresIn: '15m' });
  const headers = { Authorization: `Bearer ${token}` };

  const listResp = await fetch(`${BASE_URL}/admin/respuestas?page=1&limit=500`, { headers });
  const listJson = await listResp.json();
  const all = listJson?.respuestas || [];

  const hospitalRows = all.filter((r) => HOSPITAL_VARIANTS.has(norm(r.hospital)));
  if (hospitalRows.length === 0) throw new Error('No hay encuestas del Hospital Regional de Quiche para pruebas.');

  const fechas = hospitalRows.map((r) => gtDateIso(r.created_at)).sort();
  const fechaInicio = fechas[0];
  const fechaFin = fechas[fechas.length - 1];

  const detailsById = new Map();
  for (const row of hospitalRows) {
    const dResp = await fetch(`${BASE_URL}/admin/respuestas/${row.id}`, { headers });
    const dJson = await dResp.json();
    detailsById.set(row.id, dJson?.respuesta?.detalles || []);
  }

  const periodoRows = hospitalRows
    .filter((r) => isInGuatemalaDateRange(r.created_at, fechaInicio, fechaFin))
    .sort((a, b) => {
      const ad = new Date(a.created_at).getTime();
      const bd = new Date(b.created_at).getTime();
      if (ad !== bd) return ad - bd;
      return a.id - b.id;
    });

  const servicioCounts = { consulta_externa: 0, emergencia: 0, encamamiento: 0 };
  periodoRows.forEach((r) => {
    const s = normalizeServicio(r.servicio);
    if (s) servicioCounts[s] += 1;
  });

  const resumenResp = await fetch(`${BASE_URL}/reportes/mspas/resumen?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, { headers });
  const resumenJson = await resumenResp.json();

  const rowsForExport = periodoRows.map((r) => ({
    ...r,
    detalles: detailsById.get(r.id) || []
  }));
  const exportResult = generateAAvWorkbook(rowsForExport, fechaInicio, fechaFin);
  const outputPath = path.join(OUT_DIR, exportResult.fileName);
  fs.writeFileSync(outputPath, exportResult.buffer);

  const wb = XLSX.read(exportResult.buffer, { type: 'buffer', cellFormula: true, cellStyles: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const tWb = XLSX.readFile(TEMPLATE_PATH, { cellFormula: true, cellStyles: true });
  const tWs = tWb.Sheets[tWb.SheetNames[0]];

  const fails = [];
  const notes = [];

  for (let r = 1; r <= 3; r += 1) {
    for (let c = XLSX.utils.decode_col('A'); c <= XLSX.utils.decode_col('FL'); c += 1) {
      const col = XLSX.utils.encode_col(c);
      const ref = `${col}${r}`;
      assert((getCell(tWs, ref) ?? '') === (getCell(ws, ref) ?? ''), `Header diferente en ${ref}`, fails);
    }
  }

  const totalRows = periodoRows.length;
  assert(totalRows === (resumenJson?.mspas?.totalEncuestas || 0), 'Total de resumen no coincide con dataset.', fails);

  const idiomaCols = ['Q','R','S','T','U','V','W','X','Y','Z','AA','AB','AC','AD','AE','AF','AG','AH','AI','AJ','AK','AL','AM','AN','AO','AP'];
  const etnicoCols = ['M', 'N', 'O', 'P'];
  const sexoCols = ['AQ', 'AR', 'AS'];
  const srvCols = ['AT', 'AU', 'AV'];

  const likertStats = {
    ok: 0,
    missing: 0,
    unknown: 0,
    dup_consistent: 0,
    dup_conflict: 0
  };

  const supportStats = {
    valid: 0,
    no_aplica: 0,
    missing: 0,
    unknown: 0,
    dup_consistent: 0,
    dup_conflict: 0
  };

  const finalStats = {
    valid: 0,
    no_aplica: 0,
    missing: 0,
    unknown: 0,
    dup_consistent: 0,
    dup_conflict: 0
  };

  for (let i = 0; i < totalRows; i += 1) {
    const rowNum = 4 + i;
    const row = periodoRows[i];

    assert(getCell(ws, `A${rowNum}`) === i + 1, `Correlativo incorrecto en fila ${rowNum}`, fails);
    assert(HOSPITAL_VARIANTS.has(norm(getCell(ws, `B${rowNum}`))), `Hospital invalido en fila ${rowNum}`, fails);

    assert(getCell(ws, `C${rowNum}`) === servicioCounts.consulta_externa, `C incorrecto fila ${rowNum}`, fails);
    assert(getCell(ws, `F${rowNum}`) === servicioCounts.emergencia, `F incorrecto fila ${rowNum}`, fails);
    assert(getCell(ws, `I${rowNum}`) === servicioCounts.encamamiento, `I incorrecto fila ${rowNum}`, fails);

    assert(getCell(ws, `D${rowNum}`) === totalRows, `D incorrecto fila ${rowNum}`, fails);
    assert(getCell(ws, `G${rowNum}`) === totalRows, `G incorrecto fila ${rowNum}`, fails);
    assert(getCell(ws, `J${rowNum}`) === totalRows, `J incorrecto fila ${rowNum}`, fails);

    assert(getFormula(ws, `E${rowNum}`) === `IF(D${rowNum}=0,0,C${rowNum}*100/D${rowNum})`, `Formula E incorrecta fila ${rowNum}`, fails);
    assert(getFormula(ws, `H${rowNum}`) === `IF(G${rowNum}=0,0,F${rowNum}*100/G${rowNum})`, `Formula H incorrecta fila ${rowNum}`, fails);
    assert(getFormula(ws, `K${rowNum}`) === `IF(J${rowNum}=0,0,I${rowNum}*100/J${rowNum})`, `Formula K incorrecta fila ${rowNum}`, fails);

    const formaEsperada = mapForma(row.forma_aplicacion);
    const formaReal = getCell(ws, `L${rowNum}`) || '';
    assert(formaReal === formaEsperada, `Forma aplicacion incorrecta fila ${rowNum}`, fails);

    const etnCol = mapEtnicoCol(row.origen_etnico);
    const etnMarked = etnicoCols.filter((col) => getCell(ws, `${col}${rowNum}`) === 1);
    assert(etnMarked.length <= 1, `One-hot etnico invalido fila ${rowNum}`, fails);
    if (etnCol) assert(etnMarked.length === 1 && etnMarked[0] === etnCol, `One-hot etnico no coincide fila ${rowNum}`, fails);

    const idiCol = mapIdiomaCol(row.idioma_predominante);
    const idiMarked = idiomaCols.filter((col) => getCell(ws, `${col}${rowNum}`) === 1);
    assert(idiMarked.length <= 1, `One-hot idioma invalido fila ${rowNum}`, fails);
    if (row.idioma_predominante) {
      if (idiCol) assert(idiMarked.length === 1 && idiMarked[0] === idiCol, `One-hot idioma no coincide fila ${rowNum}`, fails);
    } else {
      assert(idiMarked.length === 0, `Historico sin idioma no quedo vacio fila ${rowNum}`, fails);
    }

    const sexCol = mapSexoCol(row.sexo);
    const sexMarked = sexoCols.filter((col) => getCell(ws, `${col}${rowNum}`) === 1);
    assert(sexMarked.length <= 1, `One-hot sexo invalido fila ${rowNum}`, fails);
    if (sexCol) assert(sexMarked.length === 1 && sexMarked[0] === sexCol, `One-hot sexo no coincide fila ${rowNum}`, fails);

    const srvCol = mapServicioCol(row.servicio);
    const srvMarked = srvCols.filter((col) => getCell(ws, `${col}${rowNum}`) === 1);
    assert(srvMarked.length === 1 && srvMarked[0] === srvCol, `One-hot servicio incorrecto fila ${rowNum}`, fails);

    const detalles = detailsById.get(row.id) || [];
    const selectedSupport = getSelectedSupportServices(detalles);
    for (const spec of LIKERT_SPECS) {
      const expected = getLikertExpectedForQuestion(detalles, spec.questionId);
      likertStats[expected.status] += 1;

      const marks = spec.cols.filter((col) => getCell(ws, `${col}${rowNum}`) === 1);
      assert(marks.length <= 1, `Likert one-hot invalido Q${spec.questionId} fila ${rowNum}`, fails);

      if (expected.scale) {
        const expectedCol = spec.cols[SCALE_TO_INDEX[expected.scale]];
        assert(marks.length === 1 && marks[0] === expectedCol, `Likert no coincide Q${spec.questionId} fila ${rowNum}`, fails);
      } else {
        assert(marks.length === 0, `Likert debio quedar vacio Q${spec.questionId} fila ${rowNum}`, fails);
      }
      const zeros = spec.cols.filter((col) => getCell(ws, `${col}${rowNum}`) === 0);
      assert(zeros.length === 0, `Likert contiene 0 en Q${spec.questionId} fila ${rowNum}`, fails);
    }

    for (const spec of SUPPORT_SPECS) {
      const marks = spec.cols.filter((col) => getCell(ws, `${col}${rowNum}`) === 1);
      const zeros = spec.cols.filter((col) => getCell(ws, `${col}${rowNum}`) === 0);
      assert(zeros.length === 0, `Soporte contiene 0 en ${spec.serviceKey} fila ${rowNum}`, fails);

      if (!selectedSupport.has(spec.serviceKey)) {
        supportStats.no_aplica += 1;
        assert(marks.length === 0, `Soporte no aplica debio quedar vacio ${spec.serviceKey} fila ${rowNum}`, fails);
        continue;
      }

      const expected = getLikertExpectedForQuestion(detalles, spec.questionId);
      if (expected.status === 'ok') supportStats.valid += 1;
      if (expected.status === 'missing') supportStats.missing += 1;
      if (expected.status === 'unknown') supportStats.unknown += 1;
      if (expected.status === 'dup_consistent') supportStats.dup_consistent += 1;
      if (expected.status === 'dup_conflict') supportStats.dup_conflict += 1;

      assert(marks.length <= 1, `Soporte one-hot invalido ${spec.serviceKey} fila ${rowNum}`, fails);
      if (expected.scale) {
        const expectedCol = spec.cols[SCALE_TO_INDEX[expected.scale]];
        assert(marks.length === 1 && marks[0] === expectedCol, `Soporte no coincide ${spec.serviceKey} fila ${rowNum}`, fails);
      } else {
        assert(marks.length === 0, `Soporte debio quedar vacio ${spec.serviceKey} fila ${rowNum}`, fails);
      }
    }

    for (const spec of FINAL_SPECS) {
      const marks = spec.cols.filter((col) => getCell(ws, `${col}${rowNum}`) === 1);
      const zeros = spec.cols.filter((col) => getCell(ws, `${col}${rowNum}`) === 0);
      assert(zeros.length === 0, `CZFL contiene 0 en Q${spec.questionId} fila ${rowNum}`, fails);

      if (spec.appliesToService && normalizeServicio(row.servicio) !== spec.appliesToService) {
        finalStats.no_aplica += 1;
        assert(marks.length === 0, `CZFL no aplica debio quedar vacio Q${spec.questionId} fila ${rowNum}`, fails);
        continue;
      }

      const expected = getLikertExpectedForQuestion(detalles, spec.questionId);
      if (expected.status === 'ok') finalStats.valid += 1;
      if (expected.status === 'missing') finalStats.missing += 1;
      if (expected.status === 'unknown') finalStats.unknown += 1;
      if (expected.status === 'dup_consistent') finalStats.dup_consistent += 1;
      if (expected.status === 'dup_conflict') finalStats.dup_conflict += 1;

      assert(marks.length <= 1, `CZFL one-hot invalido Q${spec.questionId} fila ${rowNum}`, fails);
      if (expected.scale) {
        const expectedCol = spec.cols[SCALE_TO_INDEX[expected.scale]];
        assert(marks.length === 1 && marks[0] === expectedCol, `CZFL no coincide Q${spec.questionId} fila ${rowNum}`, fails);
      } else {
        assert(marks.length === 0, `CZFL debio quedar vacio Q${spec.questionId} fila ${rowNum}`, fails);
      }
    }

    for (let c = XLSX.utils.decode_col('FP'); c <= XLSX.utils.decode_col('FR'); c += 1) {
      const ref = `${XLSX.utils.encode_col(c)}${rowNum}`;
      const v = getCell(ws, ref);
      if (v !== undefined && v !== null && String(v).trim() !== '') {
        fails.push(`Columna posterior a FO con dato en ${ref}`);
        break;
      }
    }
  }

  const tm = JSON.stringify(tWs['!merges'] || []);
  const om = JSON.stringify(ws['!merges'] || []);
  assert(tm === om, 'Los merges no coinciden con la plantilla.', fails);

  Object.entries(ws).forEach(([ref, cell]) => {
    if (ref.startsWith('!')) return;
    const v = cell && cell.v !== undefined ? String(cell.v) : '';
    if (v.includes('#DIV/0!')) fails.push(`Error #DIV/0! en ${ref}`);
    if (v.includes('[object Object]')) fails.push(`Valor [object Object] en ${ref}`);
  });

  const emptyResp = await fetch(`${BASE_URL}/reportes/mspas/resumen?fechaInicio=2099-01-01&fechaFin=2099-01-31`, { headers });
  const emptyJson = await emptyResp.json();
  assert(emptyResp.status === 404 && !!emptyJson?.message, 'Periodo sin encuestas no devolvio mensaje claro.', fails);

  const invalidResp = await fetch(`${BASE_URL}/reportes/mspas/resumen?fechaInicio=2026-08-10&fechaFin=2026-08-01`, { headers });
  const invalidJson = await invalidResp.json();
  assert(invalidResp.status === 400 && !!invalidJson?.message, 'Periodo invalido no devolvio mensaje claro.', fails);

  notes.push({
    endpointWarningCount: exportResult.warningSummary.length,
    likertStats,
    supportStats,
    previewLikertBvCy: exportResult.preview?.likertBvCy || []
  });

  notes.push({
    finalStats,
    previewLikertCzFl: exportResult.preview?.likertCzFl || []
  });

  const result = {
    success: fails.length === 0,
    period: { fechaInicio, fechaFin },
    outputPath,
    totalRows,
    counts: servicioCounts,
    checks: {
      headersIntact: !fails.some((f) => f.startsWith('Header diferente')),
      aAvPreserved: !fails.some((f) => f.includes('incorrecta fila')),
      formulasOk: !fails.some((f) => f.includes('Formula')),
      likertAwBuOk: !fails.some((f) => f.includes('Likert')),
      likertBvCyOk: !fails.some((f) => f.includes('Soporte')),
      likertCzFlOk: !fails.some((f) => f.includes('CZFL')),
      recommendationOk: !fails.some((f) => f.includes('Recomendacion')),
      postFoEmpty: !fails.some((f) => f.includes('Columna posterior a FO')),
      mergesIntact: !fails.some((f) => f.includes('merges')),
      noDiv0: !fails.some((f) => f.includes('#DIV/0!')),
      noObjectObject: !fails.some((f) => f.includes('[object Object]'))
    },
    notes,
    failures: fails
  };

  const resultPath = path.join(OUT_DIR, 'mspas-final-cz-fl-test-result.json');
  fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));

  console.log(JSON.stringify(result, null, 2));
  if (!result.success) process.exitCode = 2;
})();
