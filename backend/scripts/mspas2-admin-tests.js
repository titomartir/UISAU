#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const BASE_URL = 'http://192.168.10.253:15000/api';

function readEnvValue(filePath, key) {
  const content = fs.readFileSync(filePath, 'utf8');
  const line = content.split(/\r?\n/).find((l) => l.startsWith(`${key}=`));
  if (!line) return null;
  return line.slice(key.length + 1).trim();
}

(async () => {
  const root = path.resolve(__dirname, '../..');
  const envPath = path.join(root, '.env.production');
  const jwtSecret = readEnvValue(envPath, 'JWT_SECRET');

  if (!jwtSecret) {
    throw new Error('No se encontró JWT_SECRET en .env.production');
  }

  // Token técnico para pruebas de endpoints protegidos.
  const token = jwt.sign(
    { id: 1, email: 'admin@local.test', rol: 'admin' },
    jwtSecret,
    { expiresIn: '15m' }
  );

  const headers = { Authorization: `Bearer ${token}` };

  const statsResp = await fetch(`${BASE_URL}/admin/stats`, { headers });
  const statsJson = await statsResp.json();

  const listResp = await fetch(`${BASE_URL}/admin/respuestas?page=1&limit=20`, { headers });
  const listJson = await listResp.json();

  const detalleResp = await fetch(`${BASE_URL}/admin/respuestas/10`, { headers });
  const detalleJson = await detalleResp.json();

  const detalleHistResp = await fetch(`${BASE_URL}/admin/respuestas/8`, { headers });
  const detalleHistJson = await detalleHistResp.json();

  const csvResp = await fetch(`${BASE_URL}/admin/respuestas/export?formato=csv`, { headers });
  const csvType = csvResp.headers.get('content-type') || '';

  const xlsxResp = await fetch(`${BASE_URL}/admin/respuestas/export?formato=xlsx`, { headers });
  const xlsxType = xlsxResp.headers.get('content-type') || '';

  const resultado = {
    test11_detalle_admin_muestra_campos_nuevos:
      detalleResp.status === 200 &&
      detalleJson?.respuesta?.forma_aplicacion === 'digital' &&
      detalleJson?.respuesta?.idioma_predominante === 'espanol',
    test12_historicos_siguen_visibles:
      detalleHistResp.status === 200 &&
      (detalleHistJson?.respuesta?.forma_aplicacion == null || detalleHistJson?.respuesta?.forma_aplicacion === '') &&
      (detalleHistJson?.respuesta?.idioma_predominante == null || detalleHistJson?.respuesta?.idioma_predominante === ''),
    test13_dashboard_funciona: statsResp.status === 200 && !!statsJson?.stats,
    test14_csv_funciona: csvResp.status === 200 && csvType.includes('text/csv'),
    test15_xlsx_funciona: xlsxResp.status === 200 && xlsxType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
    total_respuestas_listado: listJson?.total || 0,
    detalle_10: {
      forma_aplicacion: detalleJson?.respuesta?.forma_aplicacion ?? null,
      idioma_predominante: detalleJson?.respuesta?.idioma_predominante ?? null
    },
    detalle_8_historico: {
      forma_aplicacion: detalleHistJson?.respuesta?.forma_aplicacion ?? null,
      idioma_predominante: detalleHistJson?.respuesta?.idioma_predominante ?? null
    }
  };

  console.log(JSON.stringify(resultado, null, 2));

  const failed = Object.entries(resultado)
    .filter(([k, v]) => k.startsWith('test') && v === false)
    .map(([k]) => k);

  if (failed.length > 0) process.exitCode = 2;
})();
