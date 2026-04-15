const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RespuestaEncabezado = sequelize.define('RespuestaEncabezado', {
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
  fecha_inicio: {
    type: DataTypes.DATE,
    allowNull: true
  },
  fecha_fin: {
    type: DataTypes.DATE,
    allowNull: true
  },

  // ── Datos demográficos ───────────────────────────────────────────────────
  origen_etnico: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  edad: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: { min: 0, max: 120 }
  },
  sexo: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  departamento: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  municipio: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  hospital: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  servicio: {
    type: DataTypes.ENUM('consulta_externa', 'emergencia', 'encamamiento'),
    allowNull: false
  },

  // ── Datos de contacto (teléfono encriptado) ──────────────────────────────
  telefono_encriptado: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  email_contacto: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: { isEmail: true }
  },
  acepta_contacto: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  // ── Metadata ─────────────────────────────────────────────────────────────
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  revisada: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Marcada como revisada por el administrador'
  }
}, {
  tableName: 'respuestas_encabezado',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['created_at'] },
    { fields: ['hospital'] },
    { fields: ['servicio'] },
    { fields: ['encuesta_id'] }
  ]
});

module.exports = RespuestaEncabezado;
