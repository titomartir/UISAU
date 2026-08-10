#!/usr/bin/env node

/**
 * MSPAS Template Analyzer
 * Reads official template and extracts:
 * 1. Header structure (rows 1-3)
 * 2. Cell formatting (colors, fonts, borders, merges)
 * 3. Formulas
 * 4. Column definitions
 *
 * Output: JSON document + markdown specifications
 */

const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const TEMPLATE_PATH = path.join(__dirname, '../../..', 'audit-artifacts', 'Formato Base de datos resultados de encuesta para Hospitales.xlsx');

console.log(`📊 Analyzing template: ${TEMPLATE_PATH}`);

try {
  // Read template
  const workbook = XLSX.readFile(TEMPLATE_PATH, { cellFormula: true, cellStyles: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  console.log(`✅ Loaded sheet: "${sheetName}"`);

  // Extract header structure (rows 1-3)
  const headerStructure = {
    range: 'A1:AV3',
    rows: {},
    merges: [],
    columns: [],
    formulas: {},
  };

  // Parse all cells in header range
  const cellRegex = /^([A-Z]+)(\d+)$/;
  for (const cellRef in sheet) {
    if (cellRef.startsWith('!')) continue;

    const match = cellRef.match(cellRegex);
    if (!match) continue;

    const colLetter = match[1];
    const rowNum = parseInt(match[2], 10);

    // Convert column letter to index (A=0, B=1, ..., AV=47)
    const colIndex = colLetter.split('').reduce((acc, char) => acc * 26 + (char.charCodeAt(0) - 64), 0) - 1;

    // Only process rows 1-3 for header
    if (rowNum > 3) continue;

    const cell = sheet[cellRef];
    const rowKey = `Row${rowNum}`;

    if (!headerStructure.rows[rowKey]) {
      headerStructure.rows[rowKey] = {};
    }

    headerStructure.rows[rowKey][cellRef] = {
      value: cell.v || '',
      formula: cell.f || null,
      type: cell.t || 'general',
      style: cell.s || null,
    };

    // Collect formulas
    if (cell.f) {
      headerStructure.formulas[cellRef] = cell.f;
    }
  }

  // Parse merges (if available)
  if (sheet['!merges']) {
    headerStructure.merges = sheet['!merges'];
  }

  // Get dimensions
  const range = XLSX.utils.decode_range(sheet['!ref']);
  headerStructure.dimensions = {
    maxRow: range.e.r,
    maxCol: range.e.c,
    maxColLetter: XLSX.utils.encode_col(range.e.c),
  };

  // Build column mapping
  for (let c = 0; c <= Math.min(range.e.c, 47); c++) { // A-AV
    const colLetter = XLSX.utils.encode_col(c);
    const headerCells = [];

    for (let r = 0; r < 3; r++) {
      const cellRef = `${colLetter}${r + 1}`;
      const cell = sheet[cellRef];
      if (cell) {
        headerCells.push({
          row: r + 1,
          value: cell.v || '',
          formula: cell.f || null,
        });
      }
    }

    if (headerCells.length > 0 || c < 10) { // Include first 10 columns always
      headerStructure.columns.push({
        letter: colLetter,
        index: c,
        headerCells,
      });
    }
  }

  // Output analysis
  console.log('\n📋 HEADER STRUCTURE:');
  console.log(JSON.stringify(headerStructure, null, 2));

  // Save to file
  const analysisPath = path.join(__dirname, 'template-analysis.json');
  fs.writeFileSync(analysisPath, JSON.stringify(headerStructure, null, 2));
  console.log(`\n✅ Saved analysis to: ${analysisPath}`);

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
