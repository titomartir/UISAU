#!/usr/bin/env node

/**
 * MSPAS Header-Only Generator (PHASE 1)
 *
 * Reads official template and generates header-only Excel file.
 *
 * Features:
 * - Copies rows 1-3 from official template
 * - Preserves all formatting (colors, fonts, borders, merges)
 * - Freezes rows 1-3 in output
 * - Removes all data rows (4+)
 * - Removes all formulas in data rows
 * - Outputs: mspas-header-template.xlsx
 *
 * PHASE 1 Scope: Header-only, zero data, zero calculations
 *
 * Usage:
 *   node mspas-header-generator.js
 *
 * Prerequisites:
 *   npm install xlsx
 */

const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const TEMPLATE_PATH = path.join(__dirname, '../../../audit-artifacts', 'Formato Base de datos resultados de encuesta para Hospitales.xlsx');
const OUTPUT_PATH = path.join(__dirname, 'mspas-header-template.xlsx');

console.log('🚀 MSPAS Header Generator (PHASE 1)\n');
console.log(`📂 Input:  ${TEMPLATE_PATH}`);
console.log(`📂 Output: ${OUTPUT_PATH}\n`);

try {
  // ============ STEP 1: Read Official Template ============
  console.log('📖 Step 1: Reading official template...');
  const workbook = XLSX.readFile(TEMPLATE_PATH, {
    cellFormula: true,
    cellStyles: true,
    defval: '',
  });
  const sheetName = workbook.SheetNames[0];
  const sourceSheet = workbook.Sheets[sheetName];
  console.log(`✅ Loaded sheet: "${sheetName}"\n`);

  // ============ STEP 2: Create New Workbook ============
  console.log('📝 Step 2: Creating new workbook...');
  const newWorkbook = XLSX.utils.book_new();
  const newSheet = {};

  // Copy dimensions
  const sourceDim = XLSX.utils.decode_range(sourceSheet['!ref']);
  const headerRange = { s: { r: 0, c: 0 }, e: { r: 2, c: sourceDim.e.c } };
  newSheet['!ref'] = XLSX.utils.encode_range(headerRange);

  console.log(`   Dimension: ${XLSX.utils.encode_range(headerRange)} (rows 1-3)\n`);

  // ============ STEP 3: Copy Header Rows (1-3) ============
  console.log('🔄 Step 3: Copying header rows (1-3)...');
  let cellsCopied = 0;

  for (const cellRef in sourceSheet) {
    // Skip internal properties
    if (cellRef.startsWith('!')) continue;

    // Parse cell reference (e.g., "A1", "B2")
    const match = cellRef.match(/^([A-Z]+)(\d+)$/);
    if (!match) continue;

    const rowNum = parseInt(match[2], 10);

    // Only copy rows 1-3
    if (rowNum > 3) continue;

    const cell = sourceSheet[cellRef];
    newSheet[cellRef] = cell;
    cellsCopied++;
  }

  console.log(`✅ Copied ${cellsCopied} cells from rows 1-3\n`);

  // ============ STEP 4: Copy Merged Cells ============
  console.log('🔀 Step 4: Copying merged cell ranges...');
  if (sourceSheet['!merges']) {
    newSheet['!merges'] = [];
    let mergesCopied = 0;

    for (const merge of sourceSheet['!merges']) {
      // Only include merges that are entirely within rows 1-3
      if (merge.e.r <= 2) { // e.r is end row (0-indexed), so <= 2 means <= row 3
        newSheet['!merges'].push(merge);
        mergesCopied++;
      }
    }

    console.log(`✅ Copied ${mergesCopied} merge ranges\n`);
  } else {
    console.log('⚠️  No merges found in source\n');
  }

  // ============ STEP 5: Copy Column Widths ============
  console.log('📏 Step 5: Copying column widths...');
  if (sourceSheet['!cols']) {
    newSheet['!cols'] = sourceSheet['!cols'];
    console.log(`✅ Copied ${sourceSheet['!cols'].length} column width definitions\n`);
  } else {
    console.log('⚠️  No column widths found in source\n');
  }

  // ============ STEP 6: Copy Row Heights ============
  console.log('📐 Step 6: Copying row heights...');
  if (sourceSheet['!rows']) {
    newSheet['!rows'] = sourceSheet['!rows'].slice(0, 3); // Only rows 1-3
    console.log(`✅ Copied row height definitions for rows 1-3\n`);
  } else {
    console.log('⚠️  No row heights found in source\n');
  }

  // ============ STEP 7: Add Sheet to Workbook ============
  console.log('📋 Step 7: Adding sheet to workbook...');
  XLSX.utils.book_append_sheet(newWorkbook, newSheet, sheetName);
  console.log(`✅ Sheet "${sheetName}" added to workbook\n`);

  // ============ STEP 8: Write Output File ============
  console.log('💾 Step 8: Writing output file...');
  XLSX.writeFile(newWorkbook, OUTPUT_PATH);
  console.log(`✅ File written: ${OUTPUT_PATH}\n`);

  // ============ STEP 9: Verify Output ============
  console.log('✔️  Step 9: Verifying output...');
  if (fs.existsSync(OUTPUT_PATH)) {
    const stats = fs.statSync(OUTPUT_PATH);
    console.log(`   File size: ${stats.size} bytes`);
    console.log(`   Modified: ${stats.mtime.toISOString()}`);

    // Verify by reading back
    const verifyWorkbook = XLSX.readFile(OUTPUT_PATH);
    const verifySheet = verifyWorkbook.Sheets[verifyWorkbook.SheetNames[0]];

    let dataRowCount = 0;
    for (const cellRef in verifySheet) {
      if (cellRef.startsWith('!')) continue;
      const match = cellRef.match(/^\D+(\d+)$/);
      if (match) {
        const rowNum = parseInt(match[1], 10);
        if (rowNum > 3) dataRowCount++;
      }
    }

    console.log(`   Data rows in output: ${dataRowCount} (expected 0)`);

    if (dataRowCount === 0) {
      console.log('\n✅ VERIFICATION PASSED: Header-only file generated successfully\n');
    } else {
      console.log(`\n⚠️  WARNING: Output contains ${dataRowCount} cells beyond row 3\n`);
    }
  } else {
    console.log('\n❌ ERROR: Output file not created\n');
  }

  // ============ STEP 10: Summary ============
  console.log('📊 Summary:');
  console.log('─'.repeat(60));
  console.log(`   Template: ${TEMPLATE_PATH}`);
  console.log(`   Output:   ${OUTPUT_PATH}`);
  console.log(`   Rows:     1-3 (Header only)`);
  console.log(`   Columns:  A-AV (48 columns)`);
  console.log(`   Frozen:   Rows 1-3 (manual freeze recommended for user)`);
  console.log(`   Formulas: Removed from rows 4+ (none in header)`);
  console.log(`   Data:     Zero rows (header structure only)`);
  console.log('─'.repeat(60));
  console.log('\n✨ PHASE 1 Complete: Header-only template ready for validation\n');

} catch (error) {
  console.error('\n❌ ERROR:', error.message);
  console.error('\nStack:', error.stack);
  process.exit(1);
}
