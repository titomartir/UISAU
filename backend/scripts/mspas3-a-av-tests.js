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

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const root = path.resolve(__dirname, '../..');
  const envPath = path.join(root, '.env.production');
  const jwtSecret = readEnvValue(envPath, 'JWT_SECRET');
  if (!jwtSecret) throw new Error('No se encontró JWT_SECRET en .env.production');

  const token = jwt.sign({ id: 1, email: 'admin@local.test', rol: 'admin' }, jwtSecret, { expiresIn: '15m' });
  const headers = { Authorization: `Bearer ${token}` };

  const listResp = await fetch(`${BASE_URL}/admin/respuestas?page=1&limit=500`, { headers });
  const listJson = await listResp.json();
  const all = listJson?.respuestas || [];

  const hospitalRows = all.filter((r) => HOSPITAL_VARIANTS.has(norm(r.hospital)));
  if (hospitalRows.length === 0) throw new Error('No hay encuestas del Hospital Regional de Quiché para pruebas.');

  const fechas = hospitalRows.map((r) => gtDateIso(r.created_at)).sort();
  const fechaInicio = fechas[0];
  const fechaFin = fechas[fechas.length - 1];

  const periodoRows = hospitalRows.filter((r) => isInGuatemalaDateRange(r.created_at, fechaInicio, fechaFin));
  periodoRows.sort((a, b) => {
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
  const warnings = [];

  // 1. Headers 1-3 intact
  for (let r = 1; r <= 3; r += 1) {
    for (let c = XLSX.utils.decode_col('A'); c <= XLSX.utils.decode_col('AV'); c += 1) {
      const col = XLSX.utils.encode_col(c);
      const ref = `${col}${r}`;
      const tv = getCell(tWs, ref);
      const ov = getCell(ws, ref);
      assert((tv ?? '') === (ov ?? ''), `Header diferente en ${ref}`, fails);
    }
  }

  // 2 and 3 data starts row 4 and row count
  const totalRows = periodoRows.length;
  assert(totalRows === (resumenJson?.mspas?.totalEncuestas || 0), 'Total de resumen no coincide con dataset.', fails);

  // 4..15 row validations
  const idiomaCols = ['Q','R','S','T','U','V','W','X','Y','Z','AA','AB','AC','AD','AE','AF','AG','AH','AI','AJ','AK','AL','AM','AN','AO','AP'];
  const etnicoCols = ['M', 'N', 'O', 'P'];
  const sexoCols = ['AQ', 'AR', 'AS'];
  const srvCols = ['AT', 'AU', 'AV'];

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
  }

  // 15. columns > AV empty
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:AV3');
  for (let r = 4; r <= range.e.r + 1; r += 1) {
    for (let c = XLSX.utils.decode_col('AW'); c <= range.e.c; c += 1) {
      const ref = `${XLSX.utils.encode_col(c)}${r}`;
      const v = getCell(ws, ref);
      if (v !== undefined && v !== null && String(v).trim() !== '') {
        fails.push(`Columna posterior a AV con dato en ${ref}`);
        break;
      }
    }
  }

  // 17 + 18
  Object.entries(ws).forEach(([ref, cell]) => {
    if (ref.startsWith('!')) return;
    const v = cell && cell.v !== undefined ? String(cell.v) : '';
    if (v.includes('#DIV/0!')) fails.push(`Error #DIV/0! en ${ref}`);
    if (v.includes('[object Object]')) fails.push(`Valor [object Object] en ${ref}`);
  });

  // 19 + 21 inclusive filter dataset check
  const outside = periodoRows.filter((r) => !isInGuatemalaDateRange(r.created_at, fechaInicio, fechaFin));
  assert(outside.length === 0, 'Se detectaron registros fuera del periodo inclusivo.', fails);

  // 20 no data period clear message
  const emptyResp = await fetch(`${BASE_URL}/reportes/mspas/resumen?fechaInicio=2099-01-01&fechaFin=2099-01-31`, { headers });
  const emptyJson = await emptyResp.json();
  assert(emptyResp.status === 404 && !!emptyJson?.message, 'Periodo sin encuestas no devolvio mensaje claro.', fails);

  // Diversity checks requested for test file
  const uniqueServices = new Set(periodoRows.map((r) => normalizeServicio(r.servicio)).filter(Boolean));
  const uniqueIdiomas = new Set(periodoRows.map((r) => norm(r.idioma_predominante)).filter(Boolean));
  const uniqueEtnicos = new Set(periodoRows.map((r) => norm(r.origen_etnico)).filter(Boolean));
  const uniqueSexos = new Set(periodoRows.map((r) => norm(r.sexo)).filter(Boolean));
  const uniqueForma = new Set(periodoRows.map((r) => norm(r.forma_aplicacion)).filter(Boolean));

  if (uniqueServices.size < 3) warnings.push('El periodo no contiene los 3 servicios requeridos.');
  if (uniqueIdiomas.size < 2) warnings.push('El periodo no contiene al menos 2 idiomas.');
  if (uniqueEtnicos.size < 2) warnings.push('El periodo no contiene al menos 2 origenes etnicos.');
  if (uniqueSexos.size < 2) warnings.push('El periodo no contiene al menos 2 opciones de sexo.');
  if (!uniqueForma.has('impreso') || !uniqueForma.has('digital')) warnings.push('El periodo no contiene ambos tipos de forma (impreso/digital).');

  const result = {
    success: fails.length === 0,
    period: { fechaInicio, fechaFin },
    outputPath,
    totalRows,
    counts: servicioCounts,
    checks: {
      headersIntact: !fails.some((f) => f.startsWith('Header diferente')),
      rowCountMatch: !fails.some((f) => f.includes('Total de resumen')),
      formulasOk: !fails.some((f) => f.includes('Formula')),
      postAvEmpty: !fails.some((f) => f.includes('Columna posterior a AV')),
      noDiv0: !fails.some((f) => f.includes('#DIV/0!')),
      noObjectObject: !fails.some((f) => f.includes('[object Object]'))
    },
    warnings,
    failures: fails
  };

  const resultPath = path.join(OUT_DIR, 'mspas3-a-av-test-result.json');
  fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));

  console.log(JSON.stringify(result, null, 2));
  if (!result.success) process.exitCode = 2;
})();
