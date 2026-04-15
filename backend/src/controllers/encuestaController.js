const {
  sequelize,
  Encuesta,
  Pregunta,
  OpcionRespuesta,
  RespuestaEncabezado,
  RespuestaDetalle
} = require('../models');
const { encrypt } = require('../utils/crypto');

/**
 * GET /api/encuesta/activa
 * Devuelve la encuesta activa con todas sus preguntas y opciones ordenadas.
 */
const getEncuestaActiva = async (req, res) => {
  try {
    const encuesta = await Encuesta.findOne({
      where: { activa: true },
      include: [
        {
          model: Pregunta,
          as: 'preguntas',
          include: [
            {
              model: OpcionRespuesta,
              as: 'opciones'
            }
          ]
        }
      ],
      order: [
        [{ model: Pregunta, as: 'preguntas' }, 'orden', 'ASC'],
        [{ model: Pregunta, as: 'preguntas' }, { model: OpcionRespuesta, as: 'opciones' }, 'orden', 'ASC']
      ]
    });

    if (!encuesta) {
      return res.status(404).json({ success: false, message: 'No hay ninguna encuesta activa.' });
    }

    res.json({ success: true, encuesta });
  } catch (error) {
    console.error('[encuestaController.getEncuestaActiva]', error);
    res.status(500).json({ success: false, message: 'Error al obtener la encuesta.' });
  }
};

/**
 * POST /api/encuesta/submit
 * Body: { encabezado: {...}, respuestas: [{pregunta_id, opcion_id?, respuesta_texto?}] }
 * Guarda encabezado demográfico + todas las respuestas en transacción.
 */
const submitEncuesta = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { encabezado, respuestas } = req.body;

    // Crear el encabezado con teléfono encriptado
    const nuevaRespuesta = await RespuestaEncabezado.create(
      {
        encuesta_id: encabezado.encuesta_id,
        fecha_inicio: encabezado.fecha_inicio || new Date(),
        fecha_fin: new Date(),
        origen_etnico: encabezado.origen_etnico,
        edad: encabezado.edad,
        sexo: encabezado.sexo,
        departamento: encabezado.departamento,
        municipio: encabezado.municipio,
        hospital: encabezado.hospital,
        servicio: encabezado.servicio,
        telefono_encriptado: encrypt(encabezado.telefono),
        email_contacto: encabezado.email_contacto || null,
        acepta_contacto: encabezado.acepta_contacto || false,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'] || null
      },
      { transaction: t }
    );

    // Insertar todas las respuestas detalle en bulk
    if (Array.isArray(respuestas) && respuestas.length > 0) {
      const detalles = respuestas.map((r) => ({
        respuesta_encabezado_id: nuevaRespuesta.id,
        pregunta_id: r.pregunta_id,
        opcion_id: r.opcion_id || null,
        respuesta_texto: r.respuesta_texto || null
      }));
      await RespuestaDetalle.bulkCreate(detalles, { transaction: t });
    }

    await t.commit();
    res.status(201).json({
      success: true,
      message: '¡Gracias! Su encuesta fue enviada exitosamente.',
      id: nuevaRespuesta.id
    });
  } catch (error) {
    await t.rollback();
    console.error('[encuestaController.submitEncuesta]', error);
    res.status(500).json({ success: false, message: 'Error al guardar la encuesta. Intente nuevamente.' });
  }
};

module.exports = { getEncuestaActiva, submitEncuesta };
