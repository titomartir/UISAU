const Excel = require('exceljs');
const fs = require('fs');
const path = require('path');

function norm(s){
  if (s===undefined || s===null) return '';
  if (typeof s === 'object'){
    // ExcelJS may expose rich text or formula/result objects
    if (s.text !== undefined) return String(s.text).trim();
    if (Array.isArray(s.richText)) return s.richText.map(t=> t.text || '').join('').trim();
    if (s.result !== undefined) return String(s.result).trim();
    try { return JSON.stringify(s); } catch(e) { return String(s); }
  }
  return String(s).trim();
}

async function headersForSheet(wb, sheetName){
  const sheet = wb.getWorksheet(sheetName) || wb.getWorksheet(1);
  if (!sheet) return { headers: [], rowIndex: null };
  // detect header row within first 10 rows by choosing the row with most non-empty cells
  function detectHeaderRow(sheet, from=1, to=10){
    let best = {row: from, nonEmpty: -1};
    for (let r=from;r<=to && r<=sheet.rowCount;r++){
      const row = sheet.getRow(r);
      const vals = row.values ? row.values.slice(1) : [];
      const nonEmpty = vals.filter(v=> v!==undefined && v!==null && String(v).trim()!=='').length;
      if (nonEmpty > best.nonEmpty) best = {row: r, nonEmpty};
    }
    return best.row;
  }
  const headerRow = detectHeaderRow(sheet,1,10);
  const row = sheet.getRow(headerRow);
  const vals = row.values ? row.values.slice(1) : [];
  const headers = vals.map(v=> norm(v));
  return { headers, rowIndex: headerRow };
}

async function sampleRows(wb, sheetName, startRow){
  const sheet = wb.getWorksheet(sheetName) || wb.getWorksheet(1);
  if (!sheet) return [];
  const last = Math.min(sheet.rowCount, startRow + 4);
  const out = [];
  for (let r = startRow; r<= last; r++){
    const row = sheet.getRow(r);
    out.push(row.values ? row.values.slice(1).map(v=> norm(v)) : []);
  }
  return out;
}

async function sampleRowsDetailed(wb, sheetName, startRow, maxRows=3){
  const sheet = wb.getWorksheet(sheetName) || wb.getWorksheet(1);
  if (!sheet) return [];
  const last = Math.min(sheet.rowCount, startRow + maxRows - 1);
  const out = [];
  for (let r = startRow; r<= last; r++){
    const row = sheet.getRow(r);
    const cells = [];
    for(let c = 1; c <= sheet.columnCount; c++){
      const cell = row.getCell(c);
      const raw = cell.value;
      cells.push({
    address: cell.address || `${c}${r}`,
    value: norm(raw),
    type: cell.type,
    formula: raw && raw.formula ? raw.formula : null,
    result: raw && raw.result !== undefined ? raw.result : null,
    constructor:
        raw && raw.constructor
            ? raw.constructor.name
            : typeof raw
});
    }
    out.push(cells);
  }
  return out;
}

async function compare(generatedPath, officialPath){
  if (!fs.existsSync(generatedPath)) throw new Error('Generated not found: '+generatedPath);
  if (!fs.existsSync(officialPath)) throw new Error('Official not found: '+officialPath);
  const gen = new Excel.Workbook();
  const off = new Excel.Workbook();
  await gen.xlsx.readFile(generatedPath);
  await off.xlsx.readFile(officialPath);

  const genSheets = gen.worksheets.map(s=>s.name);
  const offSheets = off.worksheets.map(s=>s.name);

  const report = { generated: path.basename(generatedPath), official: path.basename(officialPath), summary: {}, sheets: [] };
  report.summary.generatedSheetCount = genSheets.length;
  report.summary.officialSheetCount = offSheets.length;

  const sheetsToCheck = Array.from(new Set([...offSheets, ...genSheets]));
  for (const sh of sheetsToCheck){
    const inGen = genSheets.includes(sh);
    const inOff = offSheets.includes(sh);
    const entry = { sheet: sh, presentInGenerated: inGen, presentInOfficial: inOff };
    if (inOff && inGen){
      const gh = await headersForSheet(gen, sh);
      const oh = await headersForSheet(off, sh);
      entry.generatedHeaderRow = gh.rowIndex; entry.officialHeaderRow = oh.rowIndex;
      entry.generatedHeaders = gh.headers; entry.officialHeaders = oh.headers;
      // header diffs
      const genSet = new Set(gh.headers.map(h=>h.toLowerCase()));
      const offSet = new Set(oh.headers.map(h=>h.toLowerCase()));
      const missingInGen = [...offSet].filter(h=>!genSet.has(h));
      const extraInGen = [...genSet].filter(h=>!offSet.has(h));
      entry.missingInGenerated = missingInGen;
      entry.extraInGenerated = extraInGen;
      // sample rows (data) starting after header row if present
      const dataStartGen = gh.rowIndex ? gh.rowIndex+1 : 2;
      const dataStartOff = oh.rowIndex ? oh.rowIndex+1 : 2;
      entry.generatedSample = await sampleRows(gen, sh, dataStartGen);
      entry.officialSample = await sampleRows(off, sh, dataStartOff);
      // detailed samples including cell addresses and types for debugging/mapping
      entry.generatedSampleDetailed = await sampleRowsDetailed(gen, sh, dataStartGen, 3);
      entry.officialSampleDetailed = await sampleRowsDetailed(off, sh, dataStartOff, 3);
      entry.generatedRowCount = gen.getWorksheet(sh).rowCount;
      entry.officialRowCount = off.getWorksheet(sh).rowCount;
    }
    report.sheets.push(entry);
  }

  // counts of header mismatches
  report.summary.sheetsWithMissingHeaders = report.sheets.filter(s=> s.missingInGenerated && s.missingInGenerated.length).map(s=>s.sheet);
  report.summary.totalSheetsCompared = report.sheets.length;

  // write outputs
  const outDir = path.join(process.cwd(), 'reportes'); if (!fs.existsSync(outDir)) fs.mkdirSync(outDir,{recursive:true});
  fs.writeFileSync(path.join(outDir,'compare_report.json'), JSON.stringify(report, null, 2));
  // human readable
  const lines = [];
  lines.push(`Comparison report: generated=${report.generated} official=${report.official}`);
  lines.push(`Sheets compared: ${report.summary.totalSheetsCompared}`);
  for (const s of report.sheets){
    lines.push(`\nSheet: ${s.sheet}`);
    lines.push(`  presentInGenerated: ${s.presentInGenerated} presentInOfficial: ${s.presentInOfficial}`);
    if (s.presentInGenerated && s.presentInOfficial){
      lines.push(`  generatedHeaders(row ${s.generatedHeaderRow}): ${s.generatedHeaders.join(' | ')}`);
      lines.push(`  officialHeaders(row ${s.officialHeaderRow}): ${s.officialHeaders.join(' | ')}`);
      if (s.missingInGenerated.length) lines.push(`  MISSING IN GENERATED (from official): ${s.missingInGenerated.join(', ')}`);
      if (s.extraInGenerated.length) lines.push(`  EXTRA IN GENERATED: ${s.extraInGenerated.join(', ')}`);
      lines.push(`  generatedRowCount: ${s.generatedRowCount} officialRowCount: ${s.officialRowCount}`);
      lines.push(`  generatedSample(3 rows):`);
      s.generatedSample.slice(0,3).forEach(r=> lines.push('    '+JSON.stringify(r)));
      lines.push(`  officialSample(3 rows):`);
      s.officialSample.slice(0,3).forEach(r=> lines.push('    '+JSON.stringify(r)));
    }
  }
  fs.writeFileSync(path.join(outDir,'compare_report.txt'), lines.join('\n'));
  console.log('Wrote compare_report.json and compare_report.txt to', outDir);
  return report;
}

// CLI
if (require.main === module){
  const a = process.argv.slice(2);
  if (a.length < 2){ console.error('Usage: node compare_reports.js <generated.xlsx> <official.xlsx>'); process.exit(2); }
  compare(a[0], a[1]).then(()=> process.exit(0)).catch(e=>{ console.error(e); process.exit(3); });
}

module.exports = { compare };
