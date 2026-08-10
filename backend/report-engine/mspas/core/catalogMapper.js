const { normalizeCatalogValue } = require('./normalization');

function createCatalogLookup(entries) {
  const lookup = new Map();

  entries.forEach((entry) => {
    const normalizedCanonical = normalizeCatalogValue(entry.canonical);
    if (normalizedCanonical) {
      lookup.set(normalizedCanonical, entry.code);
    }

    (entry.aliases || []).forEach((alias) => {
      const normalizedAlias = normalizeCatalogValue(alias);
      if (normalizedAlias) {
        lookup.set(normalizedAlias, entry.code);
      }
    });
  });

  return lookup;
}

function mapCatalogValueToCode(rawValue, lookup, options = {}) {
  const normalized = normalizeCatalogValue(rawValue);
  const unknownCode = options.unknownCode || null;

  if (!normalized) {
    return {
      status: 'empty',
      normalized,
      code: null
    };
  }

  if (lookup.has(normalized)) {
    return {
      status: 'mapped',
      normalized,
      code: lookup.get(normalized)
    };
  }

  if (unknownCode !== null && unknownCode !== undefined) {
    return {
      status: 'fallback_unknown',
      normalized,
      code: unknownCode
    };
  }

  return {
    status: 'unknown',
    normalized,
    code: null
  };
}

function buildOneHotAssignments(contractColumns, selectedCode, options = {}) {
  const emptyValue = options.emptyValue !== undefined ? options.emptyValue : '';
  const markedValue = options.markedValue !== undefined ? options.markedValue : 1;

  const assignments = {};
  contractColumns.forEach((column) => {
    assignments[column.excelColumn] = emptyValue;
  });

  if (selectedCode !== null && selectedCode !== undefined) {
    const target = contractColumns.find((column) => column.code === selectedCode);
    if (target) {
      assignments[target.excelColumn] = markedValue;
    }
  }

  return assignments;
}

module.exports = {
  createCatalogLookup,
  mapCatalogValueToCode,
  buildOneHotAssignments
};
