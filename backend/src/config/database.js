const { Sequelize } = require('sequelize');
const { getDatabaseConfig } = require('./env');

const config = getDatabaseConfig();

const sequelize = new Sequelize(
  config.name,
  config.user,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development'
      ? (msg) => console.log('[Sequelize]', msg)
      : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      underscored: false,
      freezeTableName: true
    }
  }
);

module.exports = sequelize;
