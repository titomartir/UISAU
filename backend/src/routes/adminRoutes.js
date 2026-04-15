const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  getDashboardStats,
  getRespuestas,
  getRespuestaDetalle,
  marcarRevisada,
  exportarRespuestas
} = require('../controllers/adminController');

const router = express.Router();

// Proteger todas las rutas del panel admin con JWT
router.use(authMiddleware);

// GET /api/admin/stats       — Estadísticas del dashboard
router.get('/stats', getDashboardStats);

// GET /api/admin/respuestas  — Listado paginado con filtros
// IMPORTANTE: /export debe ir ANTES de /:id para no ser interceptada
router.get('/respuestas/export', exportarRespuestas);

// GET /api/admin/respuestas      — Listado
router.get('/respuestas', getRespuestas);

// GET /api/admin/respuestas/:id  — Detalle completo
router.get('/respuestas/:id', getRespuestaDetalle);

// PATCH /api/admin/respuestas/:id/revisada  — Alternar estado revisada
router.patch('/respuestas/:id/revisada', marcarRevisada);

module.exports = router;
