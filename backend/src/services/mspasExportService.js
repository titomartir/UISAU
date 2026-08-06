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
const COLUMNA_BU = XLSX.utils.decode_col('BU');
const COLUMNA_BV = XLSX.utils.decode_col('BV');

const LIKERT_COLUMNA_POR_ESCALA = {
  MS: 0,
  S: 1,
  N: 2,
  I: 3,
  MI: 4
};

const LIKERT_BLOQUE_AW_BU = [
  {
    questionId: 1,
    expectedOrden: 1,
    expectedCategoria: 'trato_atencion',
    expectedTextToken: 'personal medico',
    columns: ['AW', 'AX', 'AY', 'AZ', 'BA']
  },
  {
    questionId: 2,
    expectedOrden: 2,
    expectedCategoria: 'trato_atencion',
    expectedTextToken: 'personal de enfermeria',
    columns: ['BB', 'BC', 'BD', 'BE', 'BF']
  },
  {
    questionId: 3,
    expectedOrden: 3,
    expectedCategoria: 'trato_atencion',
    expectedTextToken: 'recepcion o admision',
    columns: ['BG', 'BH', 'BI', 'BJ', 'BK']
  },
  {
    questionId: 4,
    expectedOrden: 4,
    expectedCategoria: 'trato_atencion',
    expectedTextToken: 'cortesia',
    columns: ['BL', 'BM', 'BN', 'BO', 'BP']
  },
  {
    questionId: 5,
    expectedOrden: 5,
    expectedCategoria: 'trato_atencion',
    expectedTextToken: 'llamo por su nombre',
    columns: ['BQ', 'BR', 'BS', 'BT', 'BU']
  }
];

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

function mapLikertToScale(rawValue) {
  const normalized = normalizeCatalogValue(rawValue);
  if (!normalized) return null;

  if (normalized === 'muy satisfecho') return 'MS';
  if (normalized === 'satisfecho') return 'S';
  if (normalized === 'neutral' || normalized === 'neutral o indiferente' || normalized === 'indiferente') return 'N';
  if (normalized === 'insatisfecho') return 'I';
  if (normalized === 'muy insatisfecho') return 'MI';

  return null;
}

function isQuestionDefinitionMatch(detail, spec) {
  const pregunta = detail && detail.Pregunta ? detail.Pregunta : null;
  if (!pregunta) return false;

  const categoria = normalizeCatalogValue(pregunta.categoria);
  const texto = normalizeCatalogValue(pregunta.texto_pregunta);

  const expectedCategory = normalizeCatalogValue(spec.expectedCategoria);
  const expectedToken = normalizeCatalogValue(spec.expectedTextToken);

  return (
    Number(pregunta.id) === spec.questionId &&
    Number(pregunta.orden) === spec.expectedOrden &&
    categoria === expectedCategory &&
    texto.includes(expectedToken)
  );
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
    sexoNoReconocido: [],
    likertRespuestaAusente: [],
    likertValorDesconocido: [],
    likertDuplicadoConsistente: [],
    likertDuplicadoConflictivo: [],
    likertDefinicionPreguntaNoValida: []
  };
}

function buildLikertStats() {
  return LIKERT_BLOQUE_AW_BU.map((spec) => ({
    preguntaId: spec.questionId,
    columnas: spec.columns.join('-'),
    validas: 0,
    ausentes: 0,
    desconocidas: 0,
    duplicadosConsistentes: 0,
    duplicadosConflictivos: 0
  }));
}

function getLikertStat(stats, questionId) {
  return stats.find((s) => s.preguntaId === questionId);
}

function asWarningSummary(warnings) {
  const summary = [];
  Object.entries(warnings).forEach(([key, ids]) => {
    if (!ids || ids.length === 0) return;

    if (typeof ids[0] === 'object') {
      summary.push({ tipo: key, total: ids.length, ejemplos: ids.slice(0, 20) });
      return;
    }

    summary.push({ tipo: key, total: ids.length, ids: ids.slice(0, 20) });
  });
  return summary;
}

function clearColumnsRange(ws, row, startColIndex, endColIndex) {
  for (let c = startColIndex; c <= endColIndex; c += 1) {
    const ref = `${XLSX.utils.encode_col(c)}${row}`;
    delete ws[ref];
  }
}

function fillLikertBlockAwBu(ws, rowData, excelRow, warnings, likertStats) {
  LIKERT_BLOQUE_AW_BU.forEach((spec) => {
    const stat = getLikertStat(likertStats, spec.questionId);
    clearOneHotRow(ws, excelRow, spec.columns);

    const detallesPregunta = (rowData.detalles || []).filter((d) => Number(d.pregunta_id) === spec.questionId);

    const detallesValidos = detallesPregunta.filter((detalle) => {
      const isValid = isQuestionDefinitionMatch(detalle, spec);
      if (!isValid) {
        warnings.likertDefinicionPreguntaNoValida.push({
          encuestaId: rowData.id,
          preguntaId: spec.questionId,
          detalleId: detalle.id || null,
          motivo: 'definicion_pregunta_no_valida'
        });
      }
      return isValid;
    });

    const evaluados = detallesValidos
      .map((detalle) => {
        const rawValue = detalle?.opcion?.valor_texto || detalle?.respuesta_texto || '';
        return {
          detalleId: detalle.id || null,
          rawValue,
          normalizedValue: normalizeCatalogValue(rawValue),
          scale: mapLikertToScale(rawValue)
        };
      })
      .filter((item) => item.normalizedValue);

    if (evaluados.length === 0) {
      stat.ausentes += 1;
      warnings.likertRespuestaAusente.push({
        encuestaId: rowData.id,
        preguntaId: spec.questionId,
        motivo: 'respuesta_ausente'
      });
      return;
    }

    if (evaluados.length > 1) {
      const uniqueValues = new Set(evaluados.map((item) => item.normalizedValue));
      if (uniqueValues.size === 1) {
        stat.duplicadosConsistentes += 1;
        warnings.likertDuplicadoConsistente.push({
          encuestaId: rowData.id,
          preguntaId: spec.questionId,
          motivo: 'duplicado_consistente'
        });
      } else {
        stat.duplicadosConflictivos += 1;
        warnings.likertDuplicadoConflictivo.push({
          encuestaId: rowData.id,
          preguntaId: spec.questionId,
          valores: Array.from(uniqueValues),
          motivo: 'duplicado_conflictivo'
        });
        return;
      }
    }

    const first = evaluados[0];
    if (!first.scale) {
      stat.desconocidas += 1;
      warnings.likertValorDesconocido.push({
        encuestaId: rowData.id,
        preguntaId: spec.questionId,
        valor: first.rawValue,
        motivo: 'valor_desconocido'
      });
      return;
    }

    const offset = LIKERT_COLUMNA_POR_ESCALA[first.scale];
    const targetColumn = spec.columns[offset];
    setCellValue(ws, targetColumn, excelRow, 1);
    stat.validas += 1;
  });
}

function fillWorksheetRows(ws, rows, counts, warnings, likertStats) {
  const idiomaColumns = Object.values(IDIOMA_CODIGO_A_COLUMNA);
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:FO3');
  const endColIndex = range.e.c;

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

    fillLikertBlockAwBu(ws, row, excelRow, warnings, likertStats);
    clearColumnsRange(ws, excelRow, COLUMNA_BV, endColIndex);
  });

  const lastRow = 3 + rows.length;
  range.e.r = Math.max(range.e.r, lastRow - 1);
  range.e.c = Math.max(range.e.c, COLUMNA_BU);
  ws['!ref'] = XLSX.utils.encode_range(range);
}

function buildFileName(fechaInicio, fechaFin) {
  return `reporte_MSPAS_Hospital_Quiche_${fechaInicio}_${fechaFin}.xlsx`;
}

function buildExportPreview(fechaInicio, fechaFin, counts, warningSummary, likertStats) {
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
    likertAwBu: likertStats,
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
  const likertStats = buildLikertStats();

  const templatePath = getWorkbookTemplatePath();
  const workbook = XLSX.readFile(templatePath, {
    cellFormula: true,
    cellStyles: true,
    cellNF: true,
    cellDates: true
  });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  fillWorksheetRows(sheet, rows, counts, warnings, likertStats);

  const warningSummary = asWarningSummary(warnings);

  const outputBuffer = XLSX.write(workbook, {
    type: 'buffer',
    bookType: 'xlsx',
    compression: true
  });

  return {
    fileName: buildFileName(fechaInicio, fechaFin),
    buffer: outputBuffer,
    preview: buildExportPreview(fechaInicio, fechaFin, counts, warningSummary, likertStats),
    rows,
    counts,
    likertStats,
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