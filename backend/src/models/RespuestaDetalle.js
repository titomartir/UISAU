const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RespuestaDetalle = sequelize.define('RespuestaDetalle', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  respuesta_encabezado_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'respuestas_encabezado', key: 'id' }
  },
  pregunta_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'preguntas', key: 'id' }
  },
  opcion_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'opciones_respuesta', key: 'id' }
  },
  respuesta_texto: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'respuestas_detalle',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['respuesta_encabezado_id'] },
    { fields: ['pregunta_id'] }
  ]
});

module.exports = RespuestaDetalle;
