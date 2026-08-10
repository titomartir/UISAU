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
const COLUMNA_CY = XLSX.utils.decode_col('CY');
const COLUMNA_CZ = XLSX.utils.decode_col('CZ');
const COLUMNA_FL = XLSX.utils.decode_col('FL');
const COLUMNA_FM = XLSX.utils.decode_col('FM');
const COLUMNA_FO = XLSX.utils.decode_col('FO');

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

const SERVICIO_APOYO_SELECTOR_QUESTION_ID = 6;
const SERVICIO_APOYO_TOKEN_MAP = new Map([
  ['psicologia', 'psicologia'],
  ['nutricion', 'nutricion'],
  ['trabajo social', 'trabajo_social'],
  ['laboratorio clinico', 'laboratorio'],
  ['imagenes diagnosticas', 'imagenes'],
  ['uisau', 'uisau']
]);

const LIKERT_BLOQUE_BV_CY = [
  {
    serviceKey: 'psicologia',
    serviceLabel: 'Psicología',
    questionId: 7,
    expectedOrden: 7,
    expectedCategoria: 'servicios_apoyo',
    expectedTextToken: 'servicio de psicologia',
    columns: ['BV', 'BW', 'BX', 'BY', 'BZ']
  },
  {
    serviceKey: 'nutricion',
    serviceLabel: 'Nutrición',
    questionId: 8,
    expectedOrden: 8,
    expectedCategoria: 'servicios_apoyo',
    expectedTextToken: 'servicio de nutricion',
    columns: ['CA', 'CB', 'CC', 'CD', 'CE']
  },
  {
    serviceKey: 'trabajo_social',
    serviceLabel: 'Trabajo Social',
    questionId: 9,
    expectedOrden: 9,
    expectedCategoria: 'servicios_apoyo',
    expectedTextToken: 'servicio de trabajo social',
    columns: ['CF', 'CG', 'CH', 'CI', 'CJ']
  },
  {
    serviceKey: 'laboratorio',
    serviceLabel: 'Laboratorio Clínico',
    questionId: 10,
    expectedOrden: 10,
    expectedCategoria: 'servicios_apoyo',
    expectedTextToken: 'servicio de laboratorio clinico',
    columns: ['CK', 'CL', 'CM', 'CN', 'CO']
  },
  {
    serviceKey: 'imagenes',
    serviceLabel: 'Imágenes Diagnósticas',
    questionId: 11,
    expectedOrden: 11,
    expectedCategoria: 'servicios_apoyo',
    expectedTextToken: 'servicio de imagenes diagnosticas',
    columns: ['CP', 'CQ', 'CR', 'CS', 'CT']
  },
  {
    serviceKey: 'uisau',
    serviceLabel: 'UISAU',
    questionId: 12,
    expectedOrden: 12,
    expectedCategoria: 'servicios_apoyo',
    expectedTextToken: 'atencion recibida por uisau',
    columns: ['CU', 'CV', 'CW', 'CX', 'CY']
  }
];

const LIKERT_BLOQUE_CZ_FL = [
  {
    questionId: 13,
    expectedOrden: 13,
    expectedCategoria: 'comunicacion',
    expectedTextToken: 'estado de salud',
    columns: ['CZ', 'DA', 'DB', 'DC', 'DD']
  },
  {
    questionId: 14,
    expectedOrden: 14,
    expectedCategoria: 'comunicacion',
    expectedTextToken: 'idioma o lenguaje',
    columns: ['DE', 'DF', 'DG', 'DH', 'DI']
  },
  {
    questionId: 15,
    expectedOrden: 15,
    expectedCategoria: 'comunicacion',
    expectedTextToken: 'diagnostico',
    columns: ['DJ', 'DK', 'DL', 'DM', 'DN']
  },
  {
    questionId: 16,
    expectedOrden: 16,
    expectedCategoria: 'tiempo_condiciones',
    expectedTextToken: 'tiempo de espera',
    columns: ['DO', 'DP', 'DQ', 'DR', 'DS']
  },
  {
    questionId: 17,
    expectedOrden: 17,
    expectedCategoria: 'tiempo_condiciones',
    expectedTextToken: 'comodidad',
    columns: ['DT', 'DU', 'DV', 'DW', 'DX']
  },
  {
    questionId: 18,
    expectedOrden: 18,
    expectedCategoria: 'tiempo_condiciones',
    expectedTextToken: 'limpieza y el orden del area',
    columns: ['DY', 'DZ', 'EA', 'EB', 'EC']
  },
  {
    questionId: 19,
    expectedOrden: 19,
    expectedCategoria: 'tiempo_condiciones',
    expectedTextToken: 'limpieza de los servicios sanitarios',
    columns: ['ED', 'EE', 'EF', 'EG', 'EH']
  },
  {
    questionId: 20,
    expectedOrden: 20,
    expectedCategoria: 'tiempo_condiciones',
    expectedTextToken: 'ventilacion e iluminacion en el area de espera',
    columns: ['EI', 'EJ', 'EK', 'EL', 'EM']
  },
  {
    questionId: 21,
    expectedOrden: 21,
    expectedCategoria: 'tiempo_condiciones',
    expectedTextToken: 'ventilacion e iluminacion en el area donde fue atendido',
    columns: ['EN', 'EO', 'EP', 'EQ', 'ER']
  },
  {
    questionId: 22,
    expectedOrden: 22,
    expectedCategoria: 'tiempo_condiciones',
    expectedTextToken: 'privacidad y seguridad personal',
    columns: ['ES', 'ET', 'EU', 'EV', 'EW']
  },
  {
    questionId: 25,
    expectedOrden: 25,
    expectedCategoria: 'encamamiento',
    expectedTextToken: 'ropa de cama',
    appliesToService: 'encamamiento',
    columns: ['EX', 'EY', 'EZ', 'FA', 'FB']
  },
  {
    questionId: 26,
    expectedOrden: 26,
    expectedCategoria: 'encamamiento',
    expectedTextToken: 'alimentos proporcionados',
    appliesToService: 'encamamiento',
    columns: ['FC', 'FD', 'FE', 'FF', 'FG']
  },
  {
    questionId: 27,
    expectedOrden: 27,
    expectedCategoria: 'satisfaccion_global',
    expectedTextToken: 'nivel de satisfaccion',
    columns: ['FH', 'FI', 'FJ', 'FK', 'FL']
  }
];

const RECOMENDACION_BLOQUE_FM_FO = [
  {
    questionId: 28,
    expectedOrden: 28,
    expectedCategoria: 'satisfaccion_global',
    expectedTextToken: 'referiria el servicio',
    columns: ['FM', 'FN', 'FO']
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

function mapRecommendationToColumn(rawValue) {
  const normalized = normalizeCatalogValue(rawValue);
  if (!normalized) return null;

  if (normalized === 'si') return 'FM';
  if (normalized === 'neutral') return 'FN';
  if (normalized === 'no') return 'FO';

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
    likertDefinicionPreguntaNoValida: [],
    serviciosApoyoNoAplica: [],
    serviciosApoyoRespuestaAusente: [],
    serviciosApoyoValorDesconocido: [],
    serviciosApoyoDuplicadoConsistente: [],
    serviciosApoyoDuplicadoConflictivo: [],
    serviciosApoyoDefinicionPreguntaNoValida: [],
    serviciosApoyoSelectorDesconocido: [],
    czFlRespuestaAusente: [],
    czFlValorDesconocido: [],
    czFlDuplicadoConsistente: [],
    czFlDuplicadoConflictivo: [],
    czFlDefinicionPreguntaNoValida: [],
    fmFoRespuestaAusente: [],
    fmFoValorDesconocido: [],
    fmFoDuplicadoConsistente: [],
    fmFoDuplicadoConflictivo: [],
    fmFoDefinicionPreguntaNoValida: []
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

function buildSupportLikertStats() {
  return LIKERT_BLOQUE_BV_CY.map((spec) => ({
    serviceKey: spec.serviceKey,
    serviceLabel: spec.serviceLabel,
    preguntaId: spec.questionId,
    columnas: spec.columns.join('-'),
    validas: 0,
    noAplica: 0,
    ausentes: 0,
    desconocidas: 0,
    duplicadosConsistentes: 0,
    duplicadosConflictivos: 0
  }));
}

function buildFinalLikertStats() {
  return LIKERT_BLOQUE_CZ_FL.map((spec) => ({
    preguntaId: spec.questionId,
    columnas: spec.columns.join('-'),
    servicioAplicable: spec.appliesToService || null,
    validas: 0,
    noAplica: 0,
    ausentes: 0,
    desconocidas: 0,
    duplicadosConsistentes: 0,
    duplicadosConflictivos: 0
  }));
}

function buildRecommendationStats() {
  return RECOMENDACION_BLOQUE_FM_FO.map((spec) => ({
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

function getSupportLikertStat(stats, serviceKey) {
  return stats.find((s) => s.serviceKey === serviceKey);
}

function getFinalLikertStat(stats, questionId) {
  return stats.find((s) => s.preguntaId === questionId);
}

function getRecommendationStat(stats, questionId) {
  return stats.find((s) => s.preguntaId === questionId);
}

function normalizeSupportService(rawValue) {
  const normalized = normalizeCatalogValue(rawValue);
  if (!normalized) return null;
  return SERVICIO_APOYO_TOKEN_MAP.get(normalized) || null;
}

function collectSelectedSupportServices(rowData, warnings) {
  const selected = new Set();
  const selectorDetails = (rowData.detalles || []).filter((d) => Number(d.pregunta_id) === SERVICIO_APOYO_SELECTOR_QUESTION_ID);

  selectorDetails.forEach((detalle) => {
    const raw = detalle?.opcion?.valor_texto || detalle?.respuesta_texto || '';
    const serviceKey = normalizeSupportService(raw);
    if (!raw) return;

    if (!serviceKey) {
      warnings.serviciosApoyoSelectorDesconocido.push({
        encuestaId: rowData.id,
        detalleId: detalle.id || null,
        valor: raw,
        motivo: 'selector_desconocido'
      });
      return;
    }

    selected.add(serviceKey);
  });

  return selected;
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

function fillLikertBlockBvCy(ws, rowData, excelRow, warnings, supportLikertStats) {
  const selectedServices = collectSelectedSupportServices(rowData, warnings);

  LIKERT_BLOQUE_BV_CY.forEach((spec) => {
    const stat = getSupportLikertStat(supportLikertStats, spec.serviceKey);
    clearOneHotRow(ws, excelRow, spec.columns);

    if (!selectedServices.has(spec.serviceKey)) {
      stat.noAplica += 1;
      warnings.serviciosApoyoNoAplica.push({
        encuestaId: rowData.id,
        preguntaId: spec.questionId,
        servicio: spec.serviceKey,
        motivo: 'servicio_no_seleccionado'
      });
      return;
    }

    const detallesPregunta = (rowData.detalles || []).filter((d) => Number(d.pregunta_id) === spec.questionId);

    const detallesValidos = detallesPregunta.filter((detalle) => {
      const isValid = isQuestionDefinitionMatch(detalle, spec);
      if (!isValid) {
        warnings.serviciosApoyoDefinicionPreguntaNoValida.push({
          encuestaId: rowData.id,
          preguntaId: spec.questionId,
          servicio: spec.serviceKey,
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
      warnings.serviciosApoyoRespuestaAusente.push({
        encuestaId: rowData.id,
        preguntaId: spec.questionId,
        servicio: spec.serviceKey,
        motivo: 'respuesta_ausente'
      });
      return;
    }

    if (evaluados.length > 1) {
      const uniqueValues = new Set(evaluados.map((item) => item.normalizedValue));
      if (uniqueValues.size === 1) {
        stat.duplicadosConsistentes += 1;
        warnings.serviciosApoyoDuplicadoConsistente.push({
          encuestaId: rowData.id,
          preguntaId: spec.questionId,
          servicio: spec.serviceKey,
          motivo: 'duplicado_consistente'
        });
      } else {
        stat.duplicadosConflictivos += 1;
        warnings.serviciosApoyoDuplicadoConflictivo.push({
          encuestaId: rowData.id,
          preguntaId: spec.questionId,
          servicio: spec.serviceKey,
          valores: Array.from(uniqueValues),
          motivo: 'duplicado_conflictivo'
        });
        return;
      }
    }

    const first = evaluados[0];
    if (!first.scale) {
      stat.desconocidas += 1;
      warnings.serviciosApoyoValorDesconocido.push({
        encuestaId: rowData.id,
        preguntaId: spec.questionId,
        servicio: spec.serviceKey,
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

function fillLikertBlockCzFl(ws, rowData, excelRow, warnings, finalLikertStats) {
  LIKERT_BLOQUE_CZ_FL.forEach((spec) => {
    const stat = getFinalLikertStat(finalLikertStats, spec.questionId);
    clearOneHotRow(ws, excelRow, spec.columns);

    if (spec.appliesToService && rowData.servicioCanonico !== spec.appliesToService) {
      stat.noAplica += 1;
      return;
    }

    const detallesPregunta = (rowData.detalles || []).filter((d) => Number(d.pregunta_id) === spec.questionId);

    const detallesValidos = detallesPregunta.filter((detalle) => {
      const isValid = isQuestionDefinitionMatch(detalle, spec);
      if (!isValid) {
        warnings.czFlDefinicionPreguntaNoValida.push({
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
      warnings.czFlRespuestaAusente.push({
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
        warnings.czFlDuplicadoConsistente.push({
          encuestaId: rowData.id,
          preguntaId: spec.questionId,
          motivo: 'duplicado_consistente'
        });
      } else {
        stat.duplicadosConflictivos += 1;
        warnings.czFlDuplicadoConflictivo.push({
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
      warnings.czFlValorDesconocido.push({
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

function fillRecommendationBlockFmFo(ws, rowData, excelRow, warnings, recommendationStats) {
  RECOMENDACION_BLOQUE_FM_FO.forEach((spec) => {
    const stat = getRecommendationStat(recommendationStats, spec.questionId);
    clearOneHotRow(ws, excelRow, spec.columns);

    const detallesPregunta = (rowData.detalles || []).filter((d) => Number(d.pregunta_id) === spec.questionId);

    const detallesValidos = detallesPregunta.filter((detalle) => {
      const isValid = isQuestionDefinitionMatch(detalle, spec);
      if (!isValid) {
        warnings.fmFoDefinicionPreguntaNoValida.push({
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
          column: mapRecommendationToColumn(rawValue)
        };
      })
      .filter((item) => item.normalizedValue);

    if (evaluados.length === 0) {
      stat.ausentes += 1;
      warnings.fmFoRespuestaAusente.push({
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
        warnings.fmFoDuplicadoConsistente.push({
          encuestaId: rowData.id,
          preguntaId: spec.questionId,
          motivo: 'duplicado_consistente'
        });
      } else {
        stat.duplicadosConflictivos += 1;
        warnings.fmFoDuplicadoConflictivo.push({
          encuestaId: rowData.id,
          preguntaId: spec.questionId,
          valores: Array.from(uniqueValues),
          motivo: 'duplicado_conflictivo'
        });
        return;
      }
    }

    const first = evaluados[0];
    if (!first.column) {
      stat.desconocidas += 1;
      warnings.fmFoValorDesconocido.push({
        encuestaId: rowData.id,
        preguntaId: spec.questionId,
        valor: first.rawValue,
        motivo: 'valor_desconocido'
      });
      return;
    }

    setCellValue(ws, first.column, excelRow, 1);
    stat.validas += 1;
  });
}

function fillWorksheetRows(ws, rows, counts, warnings, likertStats, supportLikertStats, finalLikertStats, recommendationStats) {
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
    clearColumnsRange(ws, excelRow, COLUMNA_BV, COLUMNA_CY);
    fillLikertBlockBvCy(ws, row, excelRow, warnings, supportLikertStats);
    clearColumnsRange(ws, excelRow, COLUMNA_CZ, COLUMNA_FL);
    clearColumnsRange(ws, excelRow, COLUMNA_FM, endColIndex);
    fillLikertBlockCzFl(ws, row, excelRow, warnings, finalLikertStats);
    fillRecommendationBlockFmFo(ws, row, excelRow, warnings, recommendationStats);
  });

  const lastRow = 3 + rows.length;
  range.e.r = Math.max(range.e.r, lastRow - 1);
  range.e.c = Math.max(range.e.c, COLUMNA_FO);
  ws['!ref'] = XLSX.utils.encode_range(range);
}

function summarizeSupportLikertStats(supportLikertStats) {
  return supportLikertStats.reduce((acc, item) => {
    acc.validas += item.validas;
    acc.noAplica += item.noAplica;
    acc.ausentes += item.ausentes;
    acc.desconocidas += item.desconocidas;
    acc.duplicadosConsistentes += item.duplicadosConsistentes;
    acc.duplicadosConflictivos += item.duplicadosConflictivos;
    return acc;
  }, {
    validas: 0,
    noAplica: 0,
    ausentes: 0,
    desconocidas: 0,
    duplicadosConsistentes: 0,
    duplicadosConflictivos: 0
  });
}

function summarizeFinalLikertStats(finalLikertStats) {
  return finalLikertStats.reduce((acc, item) => {
    acc.validas += item.validas;
    acc.noAplica += item.noAplica;
    acc.ausentes += item.ausentes;
    acc.desconocidas += item.desconocidas;
    acc.duplicadosConsistentes += item.duplicadosConsistentes;
    acc.duplicadosConflictivos += item.duplicadosConflictivos;
    return acc;
  }, {
    validas: 0,
    noAplica: 0,
    ausentes: 0,
    desconocidas: 0,
    duplicadosConsistentes: 0,
    duplicadosConflictivos: 0
  });
}

function summarizeRecommendationStats(recommendationStats) {
  return recommendationStats.reduce((acc, item) => {
    acc.validas += item.validas;
    acc.ausentes += item.ausentes;
    acc.desconocidas += item.desconocidas;
    acc.duplicadosConsistentes += item.duplicadosConsistentes;
    acc.duplicadosConflictivos += item.duplicadosConflictivos;
    return acc;
  }, {
    validas: 0,
    ausentes: 0,
    desconocidas: 0,
    duplicadosConsistentes: 0,
    duplicadosConflictivos: 0
  });
}

function buildFileName(fechaInicio, fechaFin) {
  return `reporte_MSPAS_Hospital_Quiche_${fechaInicio}_${fechaFin}.xlsx`;
}

function buildExportPreview(fechaInicio, fechaFin, counts, warningSummary, likertStats, supportLikertStats, finalLikertStats, recommendationStats) {
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
    likertBvCy: supportLikertStats,
    soporteResumen: summarizeSupportLikertStats(supportLikertStats),
    likertCzFl: finalLikertStats,
    czflResumen: summarizeFinalLikertStats(finalLikertStats),
    recomendacionFmFo: recommendationStats,
    fmFoResumen: summarizeRecommendationStats(recommendationStats),
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
  const supportLikertStats = buildSupportLikertStats();
  const finalLikertStats = buildFinalLikertStats();
  const recommendationStats = buildRecommendationStats();

  const templatePath = getWorkbookTemplatePath();
  const workbook = XLSX.readFile(templatePath, {
    cellFormula: true,
    cellStyles: true,
    cellNF: true,
    cellDates: true
  });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  fillWorksheetRows(sheet, rows, counts, warnings, likertStats, supportLikertStats, finalLikertStats, recommendationStats);

  const warningSummary = asWarningSummary(warnings);

  const outputBuffer = XLSX.write(workbook, {
    type: 'buffer',
    bookType: 'xlsx',
    compression: true
  });

  return {
    fileName: buildFileName(fechaInicio, fechaFin),
    buffer: outputBuffer,
    preview: buildExportPreview(fechaInicio, fechaFin, counts, warningSummary, likertStats, supportLikertStats, finalLikertStats, recommendationStats),
    rows,
    counts,
    likertStats,
    supportLikertStats,
    finalLikertStats,
    recommendationStats,
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