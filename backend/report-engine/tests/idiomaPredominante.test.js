const test = require('node:test');
const assert = require('node:assert/strict');

const { pipeline, contracts } = require('../mspas');

const idiomaCases = [
  ['Achi', 1, 'Q'],
  ['Akateko', 2, 'R'],
  ['Awakateco', 3, 'S'],
  ['Chalchiteko', 4, 'T'],
  ['Chaltiteko', 5, 'U'],
  ['Chuj', 6, 'V'],
  ['Itza', 7, 'W'],
  ['Ixil', 8, 'X'],
  ['Jakalteko', 9, 'Y'],
  ['Kaqchikel', 10, 'Z'],
  ["K'iche'", 11, 'AA'],
  ['Mam', 12, 'AB'],
  ['Mopan', 13, 'AC'],
  ['Pocomam', 14, 'AD'],
  ['Poqomchi', 15, 'AE'],
  ["Q'anjob'al", 16, 'AF'],
  ["Q'eqchi'", 17, 'AG'],
  ['Sakapulteco', 18, 'AH'],
  ['Sipakapense', 19, 'AI'],
  ['Tektiteko', 20, 'AJ'],
  ["Tz'utujil", 21, 'AK'],
  ['Uspanteko', 22, 'AL'],
  ['Xinca', 23, 'AM'],
  ['Garifuna', 24, 'AN'],
  ['Espanol', 25, 'AO'],
  ['Otro idioma', 26, 'AP']
];

function assertOneHot(result, expectedCode, expectedColumn, emptyValue = '') {
  assert.equal(result.selectedCode, expectedCode);
  assert.equal(result.selectedColumn, expectedColumn);

  contracts.idiomaPredominante.columns.forEach((column) => {
    const expected = column.excelColumn === expectedColumn ? 1 : emptyValue;
    assert.equal(result.assignments[column.excelColumn], expected, `Column ${column.excelColumn}`);
  });
}

test('maps all 26 idiomas to one-hot Excel columns', () => {
  idiomaCases.forEach(([value, code, column]) => {
    const result = pipeline.mapIdiomaPredominanteToExcel({ idioma_predominante: value });
    assertOneHot(result, code, column, '');
    assert.equal(result.status, 'mapped');
  });
});

test('supports accents, case-insensitive values and special characters', () => {
  const qa = pipeline.mapIdiomaPredominanteToExcel({ idioma_predominante: "  q'EQCHI' " });
  assertOneHot(qa, 17, 'AG', '');

  const ka = pipeline.mapIdiomaPredominanteToExcel({ idioma_predominante: 'kaqchikel' });
  assertOneHot(ka, 10, 'Z', '');

  const es = pipeline.mapIdiomaPredominanteToExcel({ idioma_predominante: 'Español' });
  assertOneHot(es, 25, 'AO', '');

  const ga = pipeline.mapIdiomaPredominanteToExcel({ idioma_predominante: 'Garífuna' });
  assertOneHot(ga, 24, 'AN', '');
});

test('empty values do not mark any idioma column', () => {
  const empty = pipeline.mapIdiomaPredominanteToExcel({ idioma_predominante: '' });
  assert.equal(empty.status, 'empty');
  assert.equal(empty.selectedCode, null);
  contracts.idiomaPredominante.columns.forEach((column) => {
    assert.equal(empty.assignments[column.excelColumn], '');
  });
});

test('invalid values fallback to code 26 (otro idiomas extranjeros)', () => {
  const result = pipeline.mapIdiomaPredominanteToExcel({ idioma_predominante: 'Aleman' });
  assert.equal(result.status, 'fallback_unknown');
  assertOneHot(result, 26, 'AP', '');
});

test('can use zero strategy for empty cells', () => {
  const result = pipeline.mapIdiomaPredominanteToExcel({ idioma_predominante: 'Achi' }, { emptyStrategy: 'zero' });
  assertOneHot(result, 1, 'Q', 0);
});
