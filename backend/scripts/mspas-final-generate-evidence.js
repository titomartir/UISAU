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
    throw new Error('No se encontro archivo MSPAS generado para evidencias.');
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
  for (let c = sc; c <= ec; c += 1) html += `<th>${XLSX.utils.encode_col(c)}</th>`;
  html += '</tr></thead><tbody>';

  for (let r = startRow; r <= endRow; r += 1) {
    html += `<tr><td>${r}</td>`;
    for (let c = sc; c <= ec; c += 1) {
      const ref = `${XLSX.utils.encode_col(c)}${r}`;
      html += `<td>${htmlEscape(cell(ws, ref))}</td>`;
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

  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:FO3');
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

  const headersToCheck = ['A', 'AV', 'AW', 'BU', 'BV', 'CY', 'CZ', 'DN', 'DO', 'EW', 'EX', 'FG', 'FH', 'FL', 'FM', 'FN', 'FO'];
  const headerCompareRows = [1, 2, 3].map((r) => {
    const row = { row: r };
    headersToCheck.forEach((col) => {
      row[`${col}_template`] = cell(tws, `${col}${r}`);
      row[`${col}_output`] = cell(ws, `${col}${r}`);
    });
    return row;
  });

  const fmFoSamples = [];
  const postFoSamples = [];
  const recommendationFilledSamples = [];
  let postFoEmpty = true;
  for (let r = firstDataRow; r <= lastDataRow; r += 1) {
    if (cell(ws, `A${r}`) === '') break;
    fmFoSamples.push({
      row: r,
      FM: cell(ws, `FM${r}`),
      FN: cell(ws, `FN${r}`),
      FO: cell(ws, `FO${r}`)
    });

    const sample = {
      row: r,
      FP: cell(ws, `FP${r}`),
      FQ: cell(ws, `FQ${r}`),
      FR: cell(ws, `FR${r}`)
    };
    postFoSamples.push(sample);
    if (String(sample.FP).trim() || String(sample.FQ).trim() || String(sample.FR).trim()) {
      postFoEmpty = false;
    }

    const hasRecommendation = String(cell(ws, `FM${r}`)).trim() || String(cell(ws, `FN${r}`)).trim() || String(cell(ws, `FO${r}`)).trim();
    if (hasRecommendation) {
      recommendationFilledSamples.push({
        row: r,
        FM: cell(ws, `FM${r}`),
        FN: cell(ws, `FN${r}`),
        FO: cell(ws, `FO${r}`)
      });
    }
  }

  for (let r = firstDataRow; r <= range.e.r + 1; r += 1) {
    if (cell(ws, `A${r}`) === '') break;
    const hasRecommendation = String(cell(ws, `FM${r}`)).trim() || String(cell(ws, `FN${r}`)).trim() || String(cell(ws, `FO${r}`)).trim();
    if (hasRecommendation) {
      recommendationFilledSamples.push({
        row: r,
        FM: cell(ws, `FM${r}`),
        FN: cell(ws, `FN${r}`),
        FO: cell(ws, `FO${r}`)
      });
    }
  }

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Evidencia MSPAS Final CZ-FL</title>
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
  <h1>Evidencia MSPAS Final CZ:FO</h1>
  <section class="card">
    <p><strong>Archivo generado:</strong> ${htmlEscape(xlsxPath)}</p>
    <p><strong>Hospital:</strong> Hospital Regional de Quiche</p>
    <p><strong>Periodo:</strong> ${htmlEscape(periodo.fechaInicio)} a ${htmlEscape(periodo.fechaFin)}</p>
    <p><strong>Verificacion posterior a FO vacio:</strong> ${postFoEmpty ? 'SI' : 'NO'}</p>
  </section>

  <section>
    <h2>A) CZ:DN — COMUNICACIÓN E INFORMACIÓN</h2>
    ${buildRangeTable(ws, 'CZ', 'DN', firstDataRow, Math.max(firstDataRow, lastDataRow))}
  </section>

  <section>
    <h2>B) DO:EW — TIEMPO Y CONDICIONES</h2>
    ${buildRangeTable(ws, 'DO', 'EW', firstDataRow, Math.max(firstDataRow, lastDataRow))}
  </section>

  <section>
    <h2>C) EX:FG — ENCAMAMIENTO</h2>
    ${buildRangeTable(ws, 'EX', 'FG', firstDataRow, Math.max(firstDataRow, lastDataRow))}
  </section>

  <section>
    <h2>D) FH:FL — SATISFACCIÓN GLOBAL</h2>
    ${buildRangeTable(ws, 'FH', 'FL', firstDataRow, Math.max(firstDataRow, lastDataRow))}
  </section>

  <section>
    <h2>E) FM:FO — REFERIRIA EL SERVICIO</h2>
    ${buildRangeTable(ws, 'FM', 'FO', firstDataRow, Math.max(firstDataRow, lastDataRow))}
  </section>

  <section>
    <h2>Evidencia A:CY intacto (muestra de filas)</h2>
    ${buildRangeTable(ws, 'A', 'CY', firstDataRow, Math.max(firstDataRow, lastDataRow))}
  </section>

  <section>
    <h2>Captura de formulas E/H/K</h2>
    <table>
      <thead><tr><th>Fila</th><th>E</th><th>H</th><th>K</th></tr></thead>
      <tbody>
        ${formulaRows.map((r) => `<tr><td>${r.row}</td><td class="mono">${htmlEscape(r.E)}</td><td class="mono">${htmlEscape(r.H)}</td><td class="mono">${htmlEscape(r.K)}</td></tr>`).join('')}
      </tbody>
    </table>
  </section>

  <section>
    <h2>Comparacion de encabezados clave filas 1-3</h2>
    <table>
      <thead>
        <tr>
          <th>Fila</th>
          ${headersToCheck.map((col) => `<th>${col} plantilla</th><th>${col} salida</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${headerCompareRows.map((r) => `<tr><td>${r.row}</td>${headersToCheck.map((col) => `<td>${htmlEscape(r[`${col}_template`])}</td><td>${htmlEscape(r[`${col}_output`])}</td>`).join('')}</tr>`).join('')}
      </tbody>
    </table>
  </section>

  <section>
    <h2>Muestra FM:FO</h2>
    <table>
      <thead><tr><th>Fila</th><th>FM</th><th>FN</th><th>FO</th></tr></thead>
      <tbody>
        ${fmFoSamples.map((r) => `<tr><td>${r.row}</td><td>${htmlEscape(r.FM)}</td><td>${htmlEscape(r.FN)}</td><td>${htmlEscape(r.FO)}</td></tr>`).join('')}
      </tbody>
    </table>
  </section>

  <section>
    <h2>Fila(s) con FM:FO poblado</h2>
    <table>
      <thead><tr><th>Fila</th><th>FM</th><th>FN</th><th>FO</th></tr></thead>
      <tbody>
        ${recommendationFilledSamples.length > 0 ? recommendationFilledSamples.map((r) => `<tr><td>${r.row}</td><td>${htmlEscape(r.FM)}</td><td>${htmlEscape(r.FN)}</td><td>${htmlEscape(r.FO)}</td></tr>`).join('') : '<tr><td colspan="4">Sin valores FM:FO en las filas muestreadas</td></tr>'}
      </tbody>
    </table>
  </section>

  <section>
    <h2>Posteriores a FO</h2>
    <table>
      <thead><tr><th>Fila</th><th>FP</th><th>FQ</th><th>FR</th></tr></thead>
      <tbody>
        ${postFoSamples.map((r) => `<tr><td>${r.row}</td><td>${htmlEscape(r.FP)}</td><td>${htmlEscape(r.FQ)}</td><td>${htmlEscape(r.FR)}</td></tr>`).join('')}
      </tbody>
    </table>
  </section>
</body>
</html>`;

  const htmlPath = path.join(OUT_DIR, 'mspas-final-evidencia.html');
  fs.writeFileSync(htmlPath, html, 'utf8');

  const meta = {
    xlsxPath,
    htmlPath,
    periodo,
    formulaRows,
    previewRows: { start: firstDataRow, end: lastDataRow },
    postFoEmpty,
    fmFoSamples,
    recommendationFilledSamples,
    postFoSamples,
    headerCompareRows
  };
  const jsonPath = path.join(OUT_DIR, 'mspas-final-evidencia.json');
  fs.writeFileSync(jsonPath, JSON.stringify(meta, null, 2));

  console.log(JSON.stringify(meta, null, 2));
})();
