const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OpcionRespuesta = sequelize.define('OpcionRespuesta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  pregunta_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'preguntas', key: 'id' }
  },
  valor_texto: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  puntaje: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Para opciones Likert: 1-5'
  },
  orden: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'opciones_respuesta',
  timestamps: false,
  indexes: [
    { fields: ['pregunta_id'] }
  ]
});

module.exports = OpcionRespuesta;
