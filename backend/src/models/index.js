/**
 * Punto central de modelos Sequelize.
 * Define todas las asociaciones (relaciones FK) entre tablas.
 */
const sequelize = require('../config/database');

const Usuario = require('./Usuario');
const Encuesta = require('./Encuesta');
const Pregunta = require('./Pregunta');
const OpcionRespuesta = require('./OpcionRespuesta');
const RespuestaEncabezado = require('./RespuestaEncabezado');
const RespuestaDetalle = require('./RespuestaDetalle');

// ── Encuesta → Preguntas ──────────────────────────────────────────────────
Encuesta.hasMany(Pregunta, {
  foreignKey: 'encuesta_id',
  as: 'preguntas',
  onDelete: 'CASCADE'
});
Pregunta.belongsTo(Encuesta, { foreignKey: 'encuesta_id' });

// ── Pregunta → Opciones ───────────────────────────────────────────────────
Pregunta.hasMany(OpcionRespuesta, {
  foreignKey: 'pregunta_id',
  as: 'opciones',
  onDelete: 'CASCADE'
});
OpcionRespuesta.belongsTo(Pregunta, { foreignKey: 'pregunta_id' });

// ── Encuesta → RespuestasEncabezado ───────────────────────────────────────
Encuesta.hasMany(RespuestaEncabezado, {
  foreignKey: 'encuesta_id',
  as: 'respuestas'
});
RespuestaEncabezado.belongsTo(Encuesta, { foreignKey: 'encuesta_id' });

// ── RespuestaEncabezado → RespuestaDetalle ────────────────────────────────
RespuestaEncabezado.hasMany(RespuestaDetalle, {
  foreignKey: 'respuesta_encabezado_id',
  as: 'detalles',
  onDelete: 'CASCADE'
});
RespuestaDetalle.belongsTo(RespuestaEncabezado, {
  foreignKey: 'respuesta_encabezado_id'
});

// ── Pregunta → RespuestaDetalle ───────────────────────────────────────────
Pregunta.hasMany(RespuestaDetalle, { foreignKey: 'pregunta_id' });
RespuestaDetalle.belongsTo(Pregunta, {
  foreignKey: 'pregunta_id',
  as: 'Pregunta'
});

// ── OpcionRespuesta → RespuestaDetalle ────────────────────────────────────
OpcionRespuesta.hasMany(RespuestaDetalle, { foreignKey: 'opcion_id' });
RespuestaDetalle.belongsTo(OpcionRespuesta, {
  foreignKey: 'opcion_id',
  as: 'opcion'
});

module.exports = {
  sequelize,
  Usuario,
  Encuesta,
  Pregunta,
  OpcionRespuesta,
  RespuestaEncabezado,
  RespuestaDetalle
};
