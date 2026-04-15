const { Op } = require('sequelize');
const {
  RespuestaEncabezado,
  RespuestaDetalle,
  Pregunta,
  OpcionRespuesta
} = require('../models');
const exportService = require('../services/exportService');

/**
 * GET /api/admin/stats
 * Estadísticas rápidas para el dashboard.
 */
const getDashboardStats = async (req, res) => {
  try {
    const totalRespuestas = await RespuestaEncabezado.count();

    // Distribución por servicio
    const { sequelize } = require('../models');
    const porServicio = await RespuestaEncabezado.findAll({
      attributes: [
        'servicio',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total']
      ],
      group: ['servicio'],
      raw: true
    });

    // Promedio de satisfacción global (categoría satisfaccion_global, tipo likert_5)
    const pregSatisfaccion = await Pregunta.findOne({
      where: { categoria: 'satisfaccion_global', tipo_respuesta: 'likert_5' },
      order: [['orden', 'ASC']]
    });

    let promedioSatisfaccion = null;
    if (pregSatisfaccion) {
      const detalles = await RespuestaDetalle.findAll({
        where: { pregunta_id: pregSatisfaccion.id },
        include: [{ model: OpcionRespuesta, as: 'opcion', attributes: ['puntaje'] }]
      });
      if (detalles.length > 0) {
        const suma = detalles.reduce((acc, d) => acc + (d.opcion ? d.opcion.puntaje : 0), 0);
        promedioSatisfaccion = parseFloat((suma / detalles.length).toFixed(2));
      }
    }

    // Distribución de recomendación
    const pregRecomendacion = await Pregunta.findOne({
      where: { categoria: 'satisfaccion_global', tipo_respuesta: 'seleccion_unica' }
    });

    const recomendacion = { si: 0, neutral: 0, no: 0 };
    if (pregRecomendacion) {
      const opciones = await OpcionRespuesta.findAll({
        where: { pregunta_id: pregRecomendacion.id }
      });
      for (const opcion of opciones) {
        const count = await RespuestaDetalle.count({ where: { opcion_id: opcion.id } });
        const texto = opcion.valor_texto.toLowerCase().trim();
        if (texto === 'sí' || texto === 'si') recomendacion.si = count;
        else if (texto === 'no') recomendacion.no = count;
        else recomendacion.neutral = count;
      }
    }

    // Respuestas de los últimos 7 días
    const hace7dias = new Date();
    hace7dias.setDate(hace7dias.getDate() - 7);
    const ultimaSemana = await RespuestaEncabezado.count({
      where: { created_at: { [Op.gte]: hace7dias } }
    });

    res.json({
      success: true,
      stats: {
        totalRespuestas,
        ultimaSemana,
        promedioSatisfaccion,
        recomendacion,
        porServicio
      }
    });
  } catch (error) {
    console.error('[adminController.getDashboardStats]', error);
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas.' });
  }
};

/**
 * GET /api/admin/respuestas
 * Query params: page, limit, fecha_inicio, fecha_fin, hospital, servicio
 */
const getRespuestas = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      fecha_inicio,
      fecha_fin,
      hospital,
      servicio
    } = req.query;

    const where = {};

    if (fecha_inicio && fecha_fin) {
      where.created_at = {
        [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)]
      };
    } else if (fecha_inicio) {
      where.created_at = { [Op.gte]: new Date(fecha_inicio) };
    } else if (fecha_fin) {
      where.created_at = { [Op.lte]: new Date(fecha_fin) };
    }

    if (hospital) {
      where.hospital = { [Op.iLike]: `%${hospital}%` };
    }
    if (servicio) {
      where.servicio = servicio;
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const { count, rows } = await RespuestaEncabezado.findAndCountAll({
      where,
      limit: limitNum,
      offset,
      order: [['created_at', 'DESC']],
      // Nunca exponer el teléfono encriptado en el listado
      attributes: { exclude: ['telefono_encriptado', 'user_agent'] }
    });

    res.json({
      success: true,
      total: count,
      totalPaginas: Math.ceil(count / limitNum),
      paginaActual: pageNum,
      respuestas: rows
    });
  } catch (error) {
    console.error('[adminController.getRespuestas]', error);
    res.status(500).json({ success: false, message: 'Error al obtener respuestas.' });
  }
};

/**
 * GET /api/admin/respuestas/:id
 * Retorna el detalle completo de una respuesta con todas las preguntas agrupadas.
 */
const getRespuestaDetalle = async (req, res) => {
  try {
    const { id } = req.params;

    const respuesta = await RespuestaEncabezado.findByPk(id, {
      attributes: { exclude: ['telefono_encriptado'] },
      include: [
        {
          model: RespuestaDetalle,
          as: 'detalles',
          include: [
            {
              model: Pregunta,
              as: 'Pregunta',
              attributes: ['id', 'texto_pregunta', 'categoria', 'orden', 'tipo_respuesta']
            },
            {
              model: OpcionRespuesta,
              as: 'opcion',
              attributes: ['valor_texto', 'puntaje']
            }
          ]
        }
      ],
      order: [
        [{ model: RespuestaDetalle, as: 'detalles' }, { model: Pregunta, as: 'Pregunta' }, 'orden', 'ASC']
      ]
    });

    if (!respuesta) {
      return res.status(404).json({ success: false, message: 'Respuesta no encontrada.' });
    }

    res.json({ success: true, respuesta });
  } catch (error) {
    console.error('[adminController.getRespuestaDetalle]', error);
    res.status(500).json({ success: false, message: 'Error al obtener el detalle.' });
  }
};

/**
 * PATCH /api/admin/respuestas/:id/revisada
 * Alterna el estado "revisada" de una respuesta.
 */
const marcarRevisada = async (req, res) => {
  try {
    const { id } = req.params;

    const respuesta = await RespuestaEncabezado.findByPk(id);
    if (!respuesta) {
      return res.status(404).json({ success: false, message: 'Respuesta no encontrada.' });
    }

    await respuesta.update({ revisada: !respuesta.revisada });
    res.json({
      success: true,
      message: respuesta.revisada ? 'Marcada como revisada.' : 'Marcada como no revisada.',
      revisada: respuesta.revisada
    });
  } catch (error) {
    console.error('[adminController.marcarRevisada]', error);
    res.status(500).json({ success: false, message: 'Error al actualizar.' });
  }
};

/**
 * GET /api/admin/respuestas/export
 * Exporta a CSV con los mismos filtros del listado.
 */
const exportarRespuestas = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, hospital, servicio } = req.query;

    const where = {};
    if (fecha_inicio && fecha_fin) {
      where.created_at = { [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)] };
    }
    if (hospital) where.hospital = { [Op.iLike]: `%${hospital}%` };
    if (servicio) where.servicio = servicio;

    const respuestas = await RespuestaEncabezado.findAll({
      where,
      attributes: { exclude: ['telefono_encriptado', 'user_agent', 'ip_address'] },
      include: [
        {
          model: RespuestaDetalle,
          as: 'detalles',
          include: [
            {
              model: Pregunta,
              as: 'Pregunta',
              attributes: ['texto_pregunta', 'categoria', 'orden']
            },
            {
              model: OpcionRespuesta,
              as: 'opcion',
              attributes: ['valor_texto', 'puntaje']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const csv = exportService.toCSV(respuestas);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="encuestas_uisau_${new Date().toISOString().slice(0, 10)}.csv"`
    );
    // Prefijo BOM para compatibilidad UTF-8 con Excel
    res.send('\uFEFF' + csv);
  } catch (error) {
    console.error('[adminController.exportarRespuestas]', error);
    res.status(500).json({ success: false, message: 'Error al exportar las respuestas.' });
  }
};

module.exports = {
  getDashboardStats,
  getRespuestas,
  getRespuestaDetalle,
  marcarRevisada,
  exportarRespuestas
};
