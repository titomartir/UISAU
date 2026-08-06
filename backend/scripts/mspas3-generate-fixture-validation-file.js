#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {
  generateAAvWorkbook
} = require('../src/services/mspasExportService');

const OUT_DIR = process.env.MSPAS3_OUT_DIR
  ? path.resolve(process.env.MSPAS3_OUT_DIR)
  : path.resolve(__dirname, '../../tools/mspas3-output');

const FIXTURE_ROWS = [
  {
    id: 90001,
    created_at: '2026-08-05T08:15:00.000Z',
    hospital: 'Hospital Regional de El Quiché',
    servicio: 'consulta_externa',
    origen_etnico: 'Maya',
    sexo: 'Masculino',
    forma_aplicacion: 'impreso',
    idioma_predominante: 'kiche'
  },
  {
    id: 90002,
    created_at: '2026-08-05T09:20:00.000Z',
    hospital: 'Hospital Regional de El Quiché',
    servicio: 'emergencia',
    origen_etnico: 'Ladino',
    sexo: 'Femenino',
    forma_aplicacion: 'digital',
    idioma_predominante: 'espanol'
  },
  {
    id: 90003,
    created_at: '2026-08-05T11:10:00.000Z',
    hospital: 'Hospital Regional de Quiché',
    servicio: 'encamamiento',
    origen_etnico: 'Garífuna',
    sexo: 'Otro',
    forma_aplicacion: 'digital',
    idioma_predominante: 'garifuna'
  },
  {
    id: 90004,
    created_at: '2026-08-05T12:35:00.000Z',
    hospital: 'Hospital Regional de Quiché',
    servicio: 'emergencia',
    origen_etnico: 'Xinka',
    sexo: 'Masculino',
    forma_aplicacion: 'impreso',
    idioma_predominante: 'qeqchi'
  }
];

(function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const fechaInicio = '2026-08-05';
  const fechaFin = '2026-08-05';

  const result = generateAAvWorkbook(FIXTURE_ROWS, fechaInicio, fechaFin);
  const outPath = path.join(OUT_DIR, `fixture_${result.fileName}`);
  fs.writeFileSync(outPath, result.buffer);

  const summary = {
    outputPath: outPath,
    period: { fechaInicio, fechaFin },
    counts: result.counts,
    warnings: result.warningSummary,
    totalRows: FIXTURE_ROWS.length,
    coverage: {
      servicios: ['consulta_externa', 'emergencia', 'encamamiento'],
      idiomas: ['kiche', 'espanol', 'garifuna', 'qeqchi'],
      etnicos: ['Maya', 'Ladino', 'Garífuna', 'Xinka'],
      sexos: ['Masculino', 'Femenino', 'Otro'],
      formas: ['impreso', 'digital']
    }
  };

  const jsonPath = path.join(OUT_DIR, 'mspas3-fixture-summary.json');
  fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 2));

  console.log(JSON.stringify(summary, null, 2));
})();
