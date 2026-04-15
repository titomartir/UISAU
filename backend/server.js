require('dotenv').config();
const app = require('./src/app');
const { sequelize } = require('./src/models');

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    // Sync: crea tablas si no existen. Usar { force: false } para no borrar datos.
    await sequelize.sync({ alter: false });
    console.log('✅ Modelos sincronizados con la base de datos.');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📋 Ambiente: ${process.env.NODE_ENV}`);
      console.log(`🏥 API Health: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ No se pudo iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();
