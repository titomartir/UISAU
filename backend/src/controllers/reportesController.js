const { Op } = require('sequelize');

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

module.exports = {
  obtenerDatosReportes,
  obtenerResumenReportes
};
