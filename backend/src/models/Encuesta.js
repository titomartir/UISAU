const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Encuesta = sequelize.define('Encuesta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  version: {
    type: DataTypes.STRING(20),
    defaultValue: '1.0'
  },
  activa: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'encuestas',
  timestamps: false
});

module.exports = Encuesta;
