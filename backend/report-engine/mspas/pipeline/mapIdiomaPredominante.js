const { idiomaLookup } = require('../catalogs/idiomas');
const { idiomaPredominanteContract } = require('../contracts/idiomaPredominanteContract');
const { mapCatalogValueToCode, buildOneHotAssignments } = require('../core/catalogMapper');

function extractIdiomaValue(input) {
  if (input === null || input === undefined) return null;

  if (typeof input === 'string') {
    return input;
  }

  // Accept both a direct payload or nested survey-like objects.
  if (typeof input === 'object') {
    if (input.idioma_predominante !== undefined) return input.idioma_predominante;
    if (input.idiomaPredominante !== undefined) return input.idiomaPredominante;
    if (input.respuesta_texto !== undefined) return input.respuesta_texto;
  }

  return null;
}

function mapIdiomaPredominanteToExcel(input, options = {}) {
  const rawValue = extractIdiomaValue(input);
  const emptyStrategy = options.emptyStrategy === 'zero' ? 'zero' : 'empty';
  const emptyValue = emptyStrategy === 'zero' ? 0 : '';
  const mappedValue = mapCatalogValueToCode(rawValue, idiomaLookup, {
    unknownCode: idiomaPredominanteContract.fallbackCodeForUnknown
  });

  const assignments = buildOneHotAssignments(
    idiomaPredominanteContract.columns,
    mappedValue.code,
    {
      emptyValue,
      markedValue: 1
    }
  );

  return {
    field: idiomaPredominanteContract.field,
    rawValue,
    normalizedValue: mappedValue.normalized,
    status: mappedValue.status,
    selectedCode: mappedValue.code,
    selectedColumn:
      mappedValue.code === null
        ? null
        : idiomaPredominanteContract.columns.find((column) => column.code === mappedValue.code)?.excelColumn || null,
    assignments
  };
}

module.exports = {
  mapIdiomaPredominanteToExcel
};
