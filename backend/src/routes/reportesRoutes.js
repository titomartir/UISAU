const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const reportesController = require('../controllers/reportesController');

const router = express.Router();

router.get('/datos', authMiddleware, reportesController.obtenerDatosReportes);
router.get('/resumen', authMiddleware, reportesController.obtenerResumenReportes);

module.exports = router;
