/**
 * Servicio de exportación a CSV para el panel administrativo.
 * Genera un CSV con BOM UTF-8 compatible con Excel.
 */

const COLUMNAS_BASE = [
  { key: 'id', header: 'ID' },
  { key: 'created_at', header: 'Fecha Envío' },
  { key: 'origen_etnico', header: 'Origen Étnico' },
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

/**
 * Escapa un valor para CSV (envuelve en comillas dobles, escapa comillas internas).
 * @param {*} value
 * @returns {string}
 */
function escaparCampo(value) {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Formatea una fecha para mostrarla legible.
 * @param {Date|string} fecha
 * @returns {string}
 */
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

/**
 * Convierte un arreglo de RespuestaEncabezado (con detalles incluidos) a CSV.
 * @param {Array} respuestas - Instancias de Sequelize con .detalles
 * @returns {string} Contenido CSV
 */
function toCSV(respuestas) {
  if (!respuestas || respuestas.length === 0) {
    return COLUMNAS_BASE.map(c => escaparCampo(c.header)).join(',') + '\n';
  }

  // Recopilar todas las preguntas únicas en orden
  const preguntasMap = new Map(); // pregunta_id → { texto, orden }
  respuestas.forEach(r => {
    const plain = r.toJSON ? r.toJSON() : r;
    if (plain.detalles) {
      plain.detalles.forEach(d => {
        if (d.Pregunta && !preguntasMap.has(d.pregunta_id)) {
          preguntasMap.set(d.pregunta_id, {
            texto: d.Pregunta.texto_pregunta,
            orden: d.Pregunta.orden || 0
          });
        }
      });
    }
  });

  // Ordenar preguntas por orden
  const preguntasOrdenadas = Array.from(preguntasMap.entries())
    .sort((a, b) => a[1].orden - b[1].orden);

  // Construir cabecera
  const cabecera = [
    ...COLUMNAS_BASE.map(c => escaparCampo(c.header)),
    ...preguntasOrdenadas.map(([, p]) => escaparCampo(p.texto))
  ].join(',');

  // Construir filas
  const filas = respuestas.map(r => {
    const plain = r.toJSON ? r.toJSON() : r;

    // Columnas base
    const baseRow = COLUMNAS_BASE.map(col => {
      const val = plain[col.key];
      if (col.key === 'created_at') return escaparCampo(formatearFecha(val));
      if (col.key === 'acepta_contacto' || col.key === 'revisada') {
        return escaparCampo(val ? 'Sí' : 'No');
      }
      return escaparCampo(val);
    });

    // Mapa de respuestas: pregunta_id → texto respuesta
    const mapaRespuestas = {};
    if (plain.detalles) {
      plain.detalles.forEach(d => {
        const valor = d.opcion ? d.opcion.valor_texto : (d.respuesta_texto || '');
        mapaRespuestas[d.pregunta_id] = valor;
      });
    }

    const respuestasRow = preguntasOrdenadas.map(([pid]) =>
      escaparCampo(mapaRespuestas[pid] || '')
    );

    return [...baseRow, ...respuestasRow].join(',');
  });

  return [cabecera, ...filas].join('\n');
}

module.exports = { toCSV };
