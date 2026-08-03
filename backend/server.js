const { getServerConfig, ConfigValidationError } = require('./src/config/env');

const config = getServerConfig();
const app = require('./src/app');
const { sequelize } = require('./src/models');

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    // Sync: crea tablas si no existen. Usar { force: false } para no borrar datos.
    await sequelize.sync({ alter: false });
    console.log('✅ Modelos sincronizados con la base de datos.');

    app.listen(config.port, config.host, () => {
      console.log(`🚀 Servidor corriendo en http://${config.host}:${config.port}`);
      console.log(`📋 Ambiente: ${config.nodeEnv}`);
      console.log(`🏥 API Health: http://${config.host}:${config.port}/api/health`);
    });
  } catch (error) {
    const message = error instanceof ConfigValidationError ? error.message : error.message;
    console.error(`❌ No se pudo iniciar el servidor: ${message}`);
    process.exit(1);
  }
}

startServer();
