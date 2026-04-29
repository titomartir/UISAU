/**
 * Servicio de exportacion para el panel administrativo.
 * Soporta CSV y XLSX.
 */

const XLSX = require('xlsx');

const COLUMNAS_BASE = [
  { key: 'id', header: 'ID' },
  { key: 'created_at', header: 'Fecha Envio' },
  { key: 'origen_etnico', header: 'Origen Etnico' },
  { key: 'edad', header: 'Edad' },
  { key: 'sexo', header: 'Sexo' },
  { key: 'departamento', header: 'Departamento' },
  { key: 'municipio', header: 'Municipio' },
  { key: 'hospital', header: 'Hospital' },
  { key: 'servicio', header: 'Servicio' },
  { key: 'email_contacto', header: 'Email Contacto' },
  { key: 'acepta_contacto', header: 'Acepta Contacto' },
  { key: 'revisada', header: 'Revisada' }
];

function escaparCampo(value) {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

function formatearFecha(fecha) {
  if (!fecha) return '';
  try {
    return new Date(fecha).toLocaleString('es-GT', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return String(fecha);
  }
}

function valorBase(plain, key) {
  const val = plain[key];
  if (key === 'created_at') return formatearFecha(val);
  if (key === 'acepta_contacto' || key === 'revisada') return val ? 'Si' : 'No';
  return val ?? '';
}

function construirEstructura(respuestas) {
  if (!respuestas || respuestas.length === 0) {
    return {
      headers: COLUMNAS_BASE.map(c => c.header),
      rows: []
    };
  }

  const preguntasMap = new Map();
  respuestas.forEach(r => {
    const plain = r.toJSON ? r.toJSON() : r;
    if (!plain.detalles) return;
    plain.detalles.forEach(d => {
      if (d.Pregunta && !preguntasMap.has(d.pregunta_id)) {
        preguntasMap.set(d.pregunta_id, {
          texto: d.Pregunta.texto_pregunta,
          orden: d.Pregunta.orden || 0
        });
      }
    });
  });

  const preguntasOrdenadas = Array.from(preguntasMap.entries())
    .sort((a, b) => a[1].orden - b[1].orden);

  const headers = [
    ...COLUMNAS_BASE.map(c => c.header),
    ...preguntasOrdenadas.map(([, p]) => p.texto)
  ];

  const rows = respuestas.map(r => {
    const plain = r.toJSON ? r.toJSON() : r;

    const baseRow = COLUMNAS_BASE.map(col => valorBase(plain, col.key));

    const mapaRespuestas = {};
    if (plain.detalles) {
      plain.detalles.forEach(d => {
        const valor = d.opcion ? d.opcion.valor_texto : (d.respuesta_texto || '');
        mapaRespuestas[d.pregunta_id] = valor;
      });
    }

    const respuestasRow = preguntasOrdenadas.map(([pid]) => mapaRespuestas[pid] || '');

    return [...baseRow, ...respuestasRow];
  });

  return { headers, rows };
}

function toCSV(respuestas) {
  const { headers, rows } = construirEstructura(respuestas);
  const cabecera = headers.map(escaparCampo).join(',');
  const body = rows.map(row => row.map(escaparCampo).join(','));
  return [cabecera, ...body].join('\n');
}

function toXLSX(respuestas) {
  const { headers, rows } = construirEstructura(respuestas);
  const aoa = [headers, ...rows];

  const worksheet = XLSX.utils.aoa_to_sheet(aoa);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Respuestas');

  return XLSX.write(workbook, {
    type: 'buffer',
    bookType: 'xlsx',
    compression: true
  });
}

module.exports = { toCSV, toXLSX };
