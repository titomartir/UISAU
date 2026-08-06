const path = require('path');
const XLSX = require('xlsx');
const { normalizeCatalogValue } = require('../../report-engine/mspas/core/normalization');
const { idiomaLookup } = require('../../report-engine/mspas/catalogs/idiomas');
const { idiomaPredominanteContract } = require('../../report-engine/mspas/contracts/idiomaPredominanteContract');

const HOSPITAL_OBJETIVO = 'Hospital Regional de Quiche';
const HOSPITAL_VARIANTES = new Set([
  normalizeCatalogValue('Hospital Regional de Quiche'),
  normalizeCatalogValue('Hospital Regional de El Quiche')
]);

const SERVICIO_COLUMNAS = {
  consulta_externa: 'AT',
  emergencia: 'AU',
  encamamiento: 'AV'
};

const SERVICIO_VARIANTES = new Map([
  ['consulta externa', 'consulta_externa'],
  ['consulta_externa', 'consulta_externa'],
  ['coex', 'consulta_externa'],
  ['emergencia', 'emergencia'],
  ['encamamiento', 'encamamiento']
]);

const ETNICO_COLUMNAS = {
  maya: 'M',
  xinca: 'N',
  xinka: 'N',
  garifuna: 'O',
  ladino: 'P',
  mestizo: 'P',
  'mestizo ladino': 'P'
};

const SEXO_COLUMNAS = {
  masculino: 'AQ',
  hombre: 'AQ',
  femenino: 'AR',
  mujer: 'AR',
  otro: 'AS'
};

const IDIOMA_CODIGO_A_COLUMNA = {
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

const COLUMNA_AV = XLSX.utils.decode_col('AV');

class PeriodValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PeriodValidationError';
  }
}

class NoDataForPeriodError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NoDataForPeriodError';
  }
}

class ServiceMappingError extends Error {
  constructor(details) {
    super('Se encontraron valores de servicio no reconocidos en el periodo.');
    this.name = 'ServiceMappingError';
    this.details = details;
  }
}

function parseIsoDate(value, fieldName) {
  if (!value) {
    throw new PeriodValidationError(`${fieldName} es obligatoria.`);
  }

  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    throw new PeriodValidationError(`${fieldName} debe tener formato YYYY-MM-DD.`);
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    iso: `${match[1]}-${match[2]}-${match[3]}`
  };
}

function buildGuatemalaRange(fechaInicio, fechaFin) {
  const start = parseIsoDate(fechaInicio, 'fechaInicio');
  const end = parseIsoDate(fechaFin, 'fechaFin');

  const startUtc = new Date(Date.UTC(start.year, start.month - 1, start.day, 6, 0, 0, 0));
  const endUtc = new Date(Date.UTC(end.year, end.month - 1, end.day + 1, 5, 59, 59, 999));

  if (startUtc.getTime() > endUtc.getTime()) {
    throw new PeriodValidationError('fechaInicio no puede ser posterior a fechaFin.');
  }

  return {
    fechaInicio: start.iso,
    fechaFin: end.iso,
    startUtc,
    endUtc
  };
}

function normalizeHospital(value) {
  return normalizeCatalogValue(value);
}

function normalizeServicio(value) {
  const normalized = normalizeCatalogValue(value);
  return SERVICIO_VARIANTES.get(normalized) || null;
}

function mapIdiomaToColumn(rawIdioma) {
  const normalized = normalizeCatalogValue(rawIdioma);
  if (!normalized) return null;

  if (IDIOMA_CODIGO_A_COLUMNA[normalized]) {
    return IDIOMA_CODIGO_A_COLUMNA[normalized];
  }

  if (idiomaLookup.has(normalized)) {
    const mappedCode = idiomaLookup.get(normalized);
    const contractColumn = idiomaPredominanteContract.columns.find((c) => c.code === mappedCode);
    return contractColumn ? contractColumn.excelColumn : null;
  }

  return null;
}

function getWorkbookTemplatePath() {
  return path.join(__dirname, '../../report-engine/mspas/mspas-header-template.xlsx');
}

function setCellValue(ws, column, row, value) {
  if (value === '' || value === null || value === undefined) return;
  const ref = `${column}${row}`;
  const type = typeof value === 'number' ? 'n' : 's';
  ws[ref] = { t: type, v: value };
}

function setCellFormula(ws, column, row, formula) {
  const ref = `${column}${row}`;
  // xlsx requiere valor inicial para conservar formulas al serializar/reabrir.
  ws[ref] = { t: 'n', f: formula, v: 0 };
}

function clearOneHotRow(ws, row, columns) {
  columns.forEach((col) => {
    const ref = `${col}${row}`;
    delete ws[ref];
  });
}

function collectSummaryRows(respuestas) {
  const invalidServices = [];

  const filtered = respuestas
    .filter((r) => HOSPITAL_VARIANTES.has(normalizeHospital(r.hospital)))
    .map((r) => {
      const servicioCanonico = normalizeServicio(r.servicio);
      if (!servicioCanonico) {
        invalidServices.push({ id: r.id, servicio: r.servicio });
      }

      return {
        ...r,
        servicioCanonico
      };
    })
    .sort((a, b) => {
      const ad = new Date(a.created_at).getTime();
      const bd = new Date(b.created_at).getTime();
      if (ad !== bd) return ad - bd;
      return a.id - b.id;
    });

  if (invalidServices.length > 0) {
    throw new ServiceMappingError(invalidServices);
  }

  return filtered;
}

function createCounts(rows) {
  const counts = {
    consulta_externa: 0,
    emergencia: 0,
    encamamiento: 0,
    total: rows.length
  };

  rows.forEach((row) => {
    counts[row.servicioCanonico] += 1;
  });

  return counts;
}

function buildWarnings() {
  return {
    formaAplicacionVacia: [],
    formaAplicacionDesconocida: [],
    etnicoNoReconocido: [],
    idiomaVacio: [],
    idiomaNoReconocido: [],
    sexoNoReconocido: []
  };
}

function asWarningSummary(warnings) {
  const summary = [];
  Object.entries(warnings).forEach(([key, ids]) => {
    if (!ids || ids.length === 0) return;
    summary.push({ tipo: key, total: ids.length, ids: ids.slice(0, 20) });
  });
  return summary;
}

function fillWorksheetRows(ws, rows, counts, warnings) {
  const idiomaColumns = Object.values(IDIOMA_CODIGO_A_COLUMNA);

  rows.forEach((row, index) => {
    const excelRow = 4 + index;
    const total = counts.total;

    setCellValue(ws, 'A', excelRow, index + 1);
    setCellValue(ws, 'B', excelRow, row.hospital || '');

    setCellValue(ws, 'C', excelRow, counts.consulta_externa);
    setCellValue(ws, 'D', excelRow, total);
    setCellFormula(ws, 'E', excelRow, `IF(D${excelRow}=0,0,C${excelRow}*100/D${excelRow})`);

    setCellValue(ws, 'F', excelRow, counts.emergencia);
    setCellValue(ws, 'G', excelRow, total);
    setCellFormula(ws, 'H', excelRow, `IF(G${excelRow}=0,0,F${excelRow}*100/G${excelRow})`);

    setCellValue(ws, 'I', excelRow, counts.encamamiento);
    setCellValue(ws, 'J', excelRow, total);
    setCellFormula(ws, 'K', excelRow, `IF(J${excelRow}=0,0,I${excelRow}*100/J${excelRow})`);

    const forma = normalizeCatalogValue(row.forma_aplicacion);
    if (!forma) {
      warnings.formaAplicacionVacia.push(row.id);
    } else if (forma === 'impreso') {
      setCellValue(ws, 'L', excelRow, 'Impreso');
    } else if (forma === 'digital') {
      setCellValue(ws, 'L', excelRow, 'Digital');
    } else {
      warnings.formaAplicacionDesconocida.push(row.id);
    }

    clearOneHotRow(ws, excelRow, ['M', 'N', 'O', 'P']);
    const etnico = normalizeCatalogValue(row.origen_etnico);
    if (etnico && ETNICO_COLUMNAS[etnico]) {
      setCellValue(ws, ETNICO_COLUMNAS[etnico], excelRow, 1);
    } else if (etnico) {
      warnings.etnicoNoReconocido.push(row.id);
    }

    clearOneHotRow(ws, excelRow, idiomaColumns);
    const idiomaCol = mapIdiomaToColumn(row.idioma_predominante);
    if (idiomaCol) {
      setCellValue(ws, idiomaCol, excelRow, 1);
    } else if (row.idioma_predominante === null || row.idioma_predominante === undefined || row.idioma_predominante === '') {
      warnings.idiomaVacio.push(row.id);
    } else {
      warnings.idiomaNoReconocido.push(row.id);
    }

    clearOneHotRow(ws, excelRow, ['AQ', 'AR', 'AS']);
    const sexo = normalizeCatalogValue(row.sexo);
    if (sexo && SEXO_COLUMNAS[sexo]) {
      setCellValue(ws, SEXO_COLUMNAS[sexo], excelRow, 1);
    } else if (sexo) {
      warnings.sexoNoReconocido.push(row.id);
    }

    clearOneHotRow(ws, excelRow, ['AT', 'AU', 'AV']);
    setCellValue(ws, SERVICIO_COLUMNAS[row.servicioCanonico], excelRow, 1);
  });

  const lastRow = 3 + rows.length;
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:AV3');
  range.e.r = Math.max(range.e.r, lastRow - 1);
  range.e.c = Math.max(range.e.c, COLUMNA_AV);
  ws['!ref'] = XLSX.utils.encode_range(range);
}

function buildFileName(fechaInicio, fechaFin) {
  return `reporte_MSPAS_Hospital_Quiche_${fechaInicio}_${fechaFin}.xlsx`;
}

function buildExportPreview(fechaInicio, fechaFin, counts, warningSummary) {
  return {
    hospital: HOSPITAL_OBJETIVO,
    periodo: {
      fechaInicio,
      fechaFin
    },
    totalEncuestas: counts.total,
    coexCount: counts.consulta_externa,
    emerCount: counts.emergencia,
    encamamientoCount: counts.encamamiento,
    warnings: warningSummary
  };
}

function generateAAvWorkbook(respuestas, fechaInicio, fechaFin) {
  const rows = collectSummaryRows(respuestas);
  if (rows.length === 0) {
    throw new NoDataForPeriodError('No existen encuestas para Hospital Regional de Quiche en el periodo seleccionado.');
  }

  const counts = createCounts(rows);
  const warnings = buildWarnings();

  const templatePath = getWorkbookTemplatePath();
  const workbook = XLSX.readFile(templatePath, {
    cellFormula: true,
    cellStyles: true,
    cellNF: true,
    cellDates: true
  });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  fillWorksheetRows(sheet, rows, counts, warnings);

  const warningSummary = asWarningSummary(warnings);

  const outputBuffer = XLSX.write(workbook, {
    type: 'buffer',
    bookType: 'xlsx',
    compression: true
  });

  return {
    fileName: buildFileName(fechaInicio, fechaFin),
    buffer: outputBuffer,
    preview: buildExportPreview(fechaInicio, fechaFin, counts, warningSummary),
    rows,
    counts,
    warnings,
    warningSummary
  };
}

module.exports = {
  HOSPITAL_OBJETIVO,
  buildGuatemalaRange,
  generateAAvWorkbook,
  PeriodValidationError,
  NoDataForPeriodError,
  ServiceMappingError
};