const { Op } = require('sequelize');
const {
  buildGuatemalaRange,
  generateAAvWorkbook,
  HOSPITAL_OBJETIVO,
  PeriodValidationError,
  NoDataForPeriodError,
  ServiceMappingError
} = require('../services/mspasExportService');

async function obtenerDatosReportes(req, res) {
  try {
    const { RespuestaEncabezado, RespuestaDetalle, Pregunta, OpcionRespuesta } = require('../models');
    const { encuestaId, fechaInicio, fechaFin } = req.query;
    const whereCondition = {};

    if (encuestaId) {
      whereCondition.encuesta_id = parseInt(encuestaId);
    }

    if (fechaInicio || fechaFin) {
      whereCondition.created_at = {};
      if (fechaInicio) {
        whereCondition.created_at[Op.gte] = new Date(fechaInicio);
      }
      if (fechaFin) {
        const fechaFinal = new Date(fechaFin);
        fechaFinal.setHours(23, 59, 59, 999);
        whereCondition.created_at[Op.lte] = fechaFinal;
      }
    }

    const respuestas = await RespuestaEncabezado.findAll({
      where: whereCondition,
      include: [
        {
          model: RespuestaDetalle,
          as: 'detalles',
          include: [
            { model: Pregunta, as: 'Pregunta' },
            { model: OpcionRespuesta, as: 'opcion' }
          ]
        }
      ]
    });

    // Construir mapa de preguntas con respuestas crudas agrupadas
    const preguntasMap = new Map();
    respuestas.forEach(respuesta => {
      if (!respuesta.detalles || respuesta.detalles.length === 0) return;
      respuesta.detalles.forEach(detalle => {
        const pregunta = detalle.Pregunta;
        const pregId = pregunta?.id;
        if (!pregId) return;

        if (!preguntasMap.has(pregId)) {
          preguntasMap.set(pregId, {
            id: pregId,
            texto: pregunta.texto_pregunta || 'Sin texto',
            tipo: pregunta.tipo_respuesta,
            orden: pregunta.orden,
            categoria: pregunta.categoria,
            respuestas: []
          });
        }

        preguntasMap.get(pregId).respuestas.push({
          valor: detalle.opcion?.valor_texto || detalle.valor_texto,
          puntaje: detalle.opcion?.puntaje
        });
      });
    });

    // Calcular estadisticas generales
    const distribucionMap = {};
    let sumaEdades = 0;
    let countEdades = 0;

    respuestas.forEach(r => {
      const servicio = r.servicio || 'desconocido';
      distribucionMap[servicio] = (distribucionMap[servicio] || 0) + 1;
      if (r.edad) {
        sumaEdades += r.edad;
        countEdades++;
      }
    });

    const distribucionPorServicio = Object.entries(distribucionMap).map(([servicio, total]) => ({
      servicio,
      total
    }));
    const edadPromedio = countEdades > 0 ? Math.round(sumaEdades / countEdades) : null;

    // Ordenar preguntas por orden
    const preguntas = Array.from(preguntasMap.values())
      .sort((a, b) => (a.orden || 0) - (b.orden || 0));

    res.json({
      success: true,
      estadisticas: {
        totalRespuestas: respuestas.length,
        distribucionPorServicio,
        edadPromedio
      },
      preguntas
    });
  } catch (error) {
    console.error('Error reportes:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function obtenerResumenReportes(req, res) {
  try {
    const { RespuestaEncabezado } = require('../models');
    const { encuestaId, fechaInicio, fechaFin } = req.query;
    const whereCondition = {};

    if (encuestaId) {
      whereCondition.encuesta_id = parseInt(encuestaId);
    }

    if (fechaInicio || fechaFin) {
      whereCondition.created_at = {};
      if (fechaInicio) {
        whereCondition.created_at[Op.gte] = new Date(fechaInicio);
      }
      if (fechaFin) {
        const fechaFinal = new Date(fechaFin);
        fechaFinal.setHours(23, 59, 59, 999);
        whereCondition.created_at[Op.lte] = fechaFinal;
      }
    }

    const totalRespuestas = await RespuestaEncabezado.count({ where: whereCondition });

    res.json({
      success: true,
      totalRespuestas
    });
  } catch (error) {
    console.error('Error resumen:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function cargarEncuestasPeriodoMspas(fechaInicio, fechaFin) {
  const {
    RespuestaEncabezado,
    RespuestaDetalle,
    Pregunta,
    OpcionRespuesta
  } = require('../models');
  const period = buildGuatemalaRange(fechaInicio, fechaFin);

  const respuestasRaw = await RespuestaEncabezado.findAll({
    where: {
      created_at: {
        [Op.gte]: period.startUtc,
        [Op.lte]: period.endUtc
      }
    },
    attributes: [
      'id',
      'created_at',
      'hospital',
      'servicio',
      'origen_etnico',
      'sexo',
      'forma_aplicacion',
      'idioma_predominante'
    ],
    include: [
      {
        model: RespuestaDetalle,
        as: 'detalles',
        required: false,
        attributes: ['id', 'pregunta_id', 'opcion_id', 'respuesta_texto'],
        include: [
          {
            model: Pregunta,
            as: 'Pregunta',
            required: false,
            attributes: ['id', 'texto_pregunta', 'categoria', 'orden', 'tipo_respuesta']
          },
          {
            model: OpcionRespuesta,
            as: 'opcion',
            required: false,
            attributes: ['id', 'valor_texto', 'puntaje']
          }
        ]
      }
    ],
    order: [
      ['created_at', 'ASC'],
      ['id', 'ASC'],
      [{ model: RespuestaDetalle, as: 'detalles' }, 'id', 'ASC']
    ]
  });

  const respuestas = respuestasRaw.map((row) => row.get({ plain: true }));

  return {
    period,
    respuestas
  };
}

async function obtenerResumenMspasPeriodo(req, res) {
  try {
    const { fechaInicio, fechaFin } = req.query;
    const { period, respuestas } = await cargarEncuestasPeriodoMspas(fechaInicio, fechaFin);
    const exportResult = generateAAvWorkbook(respuestas, period.fechaInicio, period.fechaFin);

    return res.json({
      success: true,
      mspas: exportResult.preview
    });
  } catch (error) {
    if (error instanceof PeriodValidationError) {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error instanceof NoDataForPeriodError) {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error instanceof ServiceMappingError) {
      return res.status(422).json({
        success: false,
        message: error.message,
        details: error.details
      });
    }

    console.error('Error resumen MSPAS:', error);
    return res.status(500).json({ success: false, message: 'Error al preparar el resumen MSPAS.' });
  }
}

async function exportarMspasAAv(req, res) {
  try {
    const { fechaInicio, fechaFin } = req.query;
    const { period, respuestas } = await cargarEncuestasPeriodoMspas(fechaInicio, fechaFin);
    const exportResult = generateAAvWorkbook(respuestas, period.fechaInicio, period.fechaFin);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${exportResult.fileName}"`);
    res.setHeader('X-MSPAS-Hospital', HOSPITAL_OBJETIVO);
    res.setHeader('X-MSPAS-Total', String(exportResult.counts.total));
    res.setHeader('X-MSPAS-COEX', String(exportResult.counts.consulta_externa));
    res.setHeader('X-MSPAS-EMER', String(exportResult.counts.emergencia));
    res.setHeader('X-MSPAS-ENCAMAMIENTO', String(exportResult.counts.encamamiento));
    res.setHeader('X-MSPAS-Warning-Count', String(exportResult.warningSummary.length));

    return res.send(exportResult.buffer);
  } catch (error) {
    if (error instanceof PeriodValidationError) {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error instanceof NoDataForPeriodError) {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error instanceof ServiceMappingError) {
      return res.status(422).json({
        success: false,
        message: error.message,
        details: error.details
      });
    }

    console.error('Error export MSPAS:', error);
    return res.status(500).json({ success: false, message: 'Error al exportar MSPAS.' });
  }
}

module.exports = {
  obtenerDatosReportes,
  obtenerResumenReportes,
  obtenerResumenMspasPeriodo,
  exportarMspasAAv
};
