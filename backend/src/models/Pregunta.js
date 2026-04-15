const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pregunta = sequelize.define('Pregunta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  encuesta_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'encuestas', key: 'id' }
  },
  texto_pregunta: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tipo_respuesta: {
    type: DataTypes.ENUM(
      'likert_5',
      'texto',
      'si_no',
      'seleccion_unica',
      'fecha',
      'hora',
      'checkbox'
    ),
    allowNull: false
  },
  categoria: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Agrupa las preguntas: trato_atencion, servicios_apoyo, comunicacion, tiempo_condiciones, encamamiento, satisfaccion_global, preguntas_abiertas'
  },
  orden: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  dependencia: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Ej: {"campo":"servicio","valor":"encamamiento"} o {"campo":"servicio_seleccionado","valor":"psicologia"}'
  },
  requerido: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'preguntas',
  timestamps: false,
  indexes: [
    { fields: ['encuesta_id'] },
    { fields: ['categoria'] },
    { fields: ['orden'] }
  ]
});

module.exports = Pregunta;
