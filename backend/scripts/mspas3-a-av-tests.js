#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const XLSX = require('xlsx');

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

const SCALE_TO_INDEX = {
  MS: 0,
  S: 1,
  N: 2,
  I: 3,
  MI: 4
};

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

  const exportResp = await fetch(`${BASE_URL}/reportes/mspas/export?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, { headers });
  if (!exportResp.ok) {
    const txt = await exportResp.text();
    throw new Error(`Error export MSPAS: HTTP ${exportResp.status} ${txt}`);
  }

  const buffer = Buffer.from(await exportResp.arrayBuffer());
  const dispo = exportResp.headers.get('content-disposition') || '';
  const match = dispo.match(/filename="?([^\"]+)"?/i);
  const fileName = match ? match[1] : `reporte_MSPAS_Hospital_Quiche_${fechaInicio}_${fechaFin}.xlsx`;
  const outputPath = path.join(OUT_DIR, fileName);
  fs.writeFileSync(outputPath, buffer);

  const wb = XLSX.read(buffer, { type: 'buffer', cellFormula: true, cellStyles: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const tWb = XLSX.readFile(TEMPLATE_PATH, { cellFormula: true, cellStyles: true });
  const tWs = tWb.Sheets[tWb.SheetNames[0]];

  const fails = [];
  const notes = [];

  for (let r = 1; r <= 3; r += 1) {
    for (let c = XLSX.utils.decode_col('A'); c <= XLSX.utils.decode_col('BU'); c += 1) {
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

    for (let c = XLSX.utils.decode_col('BV'); c <= XLSX.utils.decode_col('FO'); c += 1) {
      const ref = `${XLSX.utils.encode_col(c)}${rowNum}`;
      const v = getCell(ws, ref);
      if (v !== undefined && v !== null && String(v).trim() !== '') {
        fails.push(`Columna posterior a BU con dato en ${ref}`);
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
    endpointWarningCount: Number(exportResp.headers.get('x-mspas-warning-count') || 0),
    likertStats
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
      postBuEmpty: !fails.some((f) => f.includes('Columna posterior a BU')),
      mergesIntact: !fails.some((f) => f.includes('merges')),
      noDiv0: !fails.some((f) => f.includes('#DIV/0!')),
      noObjectObject: !fails.some((f) => f.includes('[object Object]'))
    },
    notes,
    failures: fails
  };

  const resultPath = path.join(OUT_DIR, 'mspas4b-aw-bu-test-result.json');
  fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));

  console.log(JSON.stringify(result, null, 2));
  if (!result.success) process.exitCode = 2;
})();
