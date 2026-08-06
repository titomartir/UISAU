#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const OUT_DIR = process.env.MSPAS3_OUT_DIR
  ? path.resolve(process.env.MSPAS3_OUT_DIR)
  : path.resolve(__dirname, '../../tools/mspas3-output');
const TEMPLATE_PATH = path.resolve(__dirname, '../report-engine/mspas/mspas-header-template.xlsx');

function readLatestXlsx(dir) {
  const files = fs.readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith('.xlsx') && f.startsWith('reporte_MSPAS_Hospital_Quiche_'))
    .map((f) => ({
      name: f,
      fullPath: path.join(dir, f),
      mtime: fs.statSync(path.join(dir, f)).mtimeMs
    }))
    .sort((a, b) => b.mtime - a.mtime);

  if (files.length === 0) {
    throw new Error('No se encontró archivo MSPAS generado para evidencias.');
  }

  return files[0].fullPath;
}

function cell(ws, ref) {
  return ws[ref] ? (ws[ref].v ?? '') : '';
}

function formula(ws, ref) {
  return ws[ref] ? (ws[ref].f ?? '') : '';
}

function htmlEscape(v) {
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildRangeTable(ws, startCol, endCol, startRow, endRow) {
  const sc = XLSX.utils.decode_col(startCol);
  const ec = XLSX.utils.decode_col(endCol);

  let html = '<table><thead><tr><th>Fila</th>';
  for (let c = sc; c <= ec; c += 1) {
    html += `<th>${XLSX.utils.encode_col(c)}</th>`;
  }
  html += '</tr></thead><tbody>';

  for (let r = startRow; r <= endRow; r += 1) {
    html += `<tr><td>${r}</td>`;
    for (let c = sc; c <= ec; c += 1) {
      const col = XLSX.utils.encode_col(c);
      const ref = `${col}${r}`;
      const v = cell(ws, ref);
      html += `<td>${htmlEscape(v === undefined ? '' : v)}</td>`;
    }
    html += '</tr>';
  }

  html += '</tbody></table>';
  return html;
}

(function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const xlsxPath = readLatestXlsx(OUT_DIR);
  const wb = XLSX.readFile(xlsxPath, { cellFormula: true });
  const ws = wb.Sheets[wb.SheetNames[0]];

  const twb = XLSX.readFile(TEMPLATE_PATH, { cellFormula: true });
  const tws = twb.Sheets[twb.SheetNames[0]];

  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:AV3');
  const firstDataRow = 4;
  const lastDataRow = Math.min(range.e.r + 1, firstDataRow + 9);

  const formulaRows = [];
  for (let r = firstDataRow; r <= lastDataRow; r += 1) {
    if (cell(ws, `A${r}`) === '') break;
    formulaRows.push({
      row: r,
      E: formula(ws, `E${r}`),
      H: formula(ws, `H${r}`),
      K: formula(ws, `K${r}`)
    });
  }

  const periodMatch = path.basename(xlsxPath).match(/_(\d{4}-\d{2}-\d{2})_(\d{4}-\d{2}-\d{2})\.xlsx$/);
  const periodo = periodMatch
    ? { fechaInicio: periodMatch[1], fechaFin: periodMatch[2] }
    : { fechaInicio: 'N/A', fechaFin: 'N/A' };

  const headerCompareRows = [1, 2, 3].map((r) => ({
    row: r,
    aTemplate: cell(tws, `A${r}`),
    aOutput: cell(ws, `A${r}`),
    lTemplate: cell(tws, `L${r}`),
    lOutput: cell(ws, `L${r}`),
    qTemplate: cell(tws, `Q${r}`),
    qOutput: cell(ws, `Q${r}`),
    avTemplate: cell(tws, `AV${r}`),
    avOutput: cell(ws, `AV${r}`)
  }));

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Evidencia MSPAS A-AV</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; color: #222; }
    h1,h2 { margin: 0 0 8px 0; }
    section { margin-bottom: 22px; }
    table { border-collapse: collapse; width: 100%; font-size: 12px; }
    th, td { border: 1px solid #bbb; padding: 6px; text-align: left; }
    th { background: #f0f0f0; }
    .mono { font-family: Consolas, monospace; }
    .card { border: 1px solid #ddd; padding: 10px; border-radius: 8px; background: #fafafa; }
  </style>
</head>
<body>
  <h1>Evidencia MSPAS A-AV</h1>
  <section class="card">
    <p><strong>Archivo generado:</strong> ${htmlEscape(xlsxPath)}</p>
    <p><strong>Hospital:</strong> Hospital Regional de Quiché</p>
    <p><strong>Período:</strong> ${htmlEscape(periodo.fechaInicio)} a ${htmlEscape(periodo.fechaFin)}</p>
  </section>

  <section>
    <h2>Captura de datos A-AV (primeras filas)</h2>
    ${buildRangeTable(ws, 'A', 'AV', firstDataRow, Math.max(firstDataRow, lastDataRow))}
  </section>

  <section>
    <h2>Captura de fórmulas E/H/K</h2>
    <table>
      <thead><tr><th>Fila</th><th>E</th><th>H</th><th>K</th></tr></thead>
      <tbody>
        ${formulaRows.map((r) => `<tr><td>${r.row}</td><td class="mono">${htmlEscape(r.E)}</td><td class="mono">${htmlEscape(r.H)}</td><td class="mono">${htmlEscape(r.K)}</td></tr>`).join('')}
      </tbody>
    </table>
  </section>

  <section>
    <h2>Comparación con encabezado aprobado (filas 1-3)</h2>
    <table>
      <thead>
        <tr>
          <th>Fila</th>
          <th>A plantilla</th><th>A salida</th>
          <th>L plantilla</th><th>L salida</th>
          <th>Q plantilla</th><th>Q salida</th>
          <th>AV plantilla</th><th>AV salida</th>
        </tr>
      </thead>
      <tbody>
        ${headerCompareRows.map((r) => `<tr><td>${r.row}</td><td>${htmlEscape(r.aTemplate)}</td><td>${htmlEscape(r.aOutput)}</td><td>${htmlEscape(r.lTemplate)}</td><td>${htmlEscape(r.lOutput)}</td><td>${htmlEscape(r.qTemplate)}</td><td>${htmlEscape(r.qOutput)}</td><td>${htmlEscape(r.avTemplate)}</td><td>${htmlEscape(r.avOutput)}</td></tr>`).join('')}
      </tbody>
    </table>
  </section>
</body>
</html>`;

  const htmlPath = path.join(OUT_DIR, 'mspas3-evidencia.html');
  fs.writeFileSync(htmlPath, html, 'utf8');

  const meta = {
    xlsxPath,
    htmlPath,
    periodo,
    formulaRows,
    previewRows: { start: firstDataRow, end: lastDataRow }
  };
  fs.writeFileSync(path.join(OUT_DIR, 'mspas3-evidencia.json'), JSON.stringify(meta, null, 2));

  console.log(JSON.stringify(meta, null, 2));
})();
