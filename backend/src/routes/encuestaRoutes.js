const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { getEncuestaActiva, submitEncuesta } = require('../controllers/encuestaController');
const { handleValidationErrors } = require('../middlewares/validationMiddleware');

const router = express.Router();

// Rate limit estricto para el envío de encuestas (5 por hora por IP)
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Ha enviado demasiadas encuestas desde esta conexión. Intente en una hora.'
  }
});

// GET /api/encuesta/activa
router.get('/activa', getEncuestaActiva);

// POST /api/encuesta/submit
router.post(
  '/submit',
  submitLimiter,
  [
    body('encabezado.encuesta_id')
      .isInt({ min: 1 }).withMessage('ID de encuesta inválido.'),
    body('encabezado.origen_etnico')
      .notEmpty().withMessage('El origen étnico es requerido.')
      .trim().escape(),
    body('encabezado.edad')
      .isInt({ min: 0, max: 120 }).withMessage('La edad debe estar entre 0 y 120.'),
    body('encabezado.sexo')
      .notEmpty().withMessage('El sexo es requerido.')
      .trim().escape(),
    body('encabezado.departamento')
      .notEmpty().withMessage('El departamento es requerido.')
      .trim().escape(),
    body('encabezado.municipio')
      .notEmpty().withMessage('El municipio es requerido.')
      .trim().escape(),
    body('encabezado.hospital')
      .notEmpty().withMessage('El hospital es requerido.')
      .trim().escape(),
    body('encabezado.servicio')
      .isIn(['consulta_externa', 'emergencia', 'encamamiento'])
      .withMessage('Servicio inválido. Debe ser: consulta_externa, emergencia o encamamiento.'),
    body('encabezado.email_contacto')
      .optional({ checkFalsy: true })
      .isEmail().withMessage('Email de contacto inválido.')
      .normalizeEmail(),
    body('encabezado.telefono')
      .optional({ checkFalsy: true })
      .trim(),
    body('respuestas')
      .isArray().withMessage('Las respuestas deben ser un arreglo.'),
    body('respuestas.*.pregunta_id')
      .isInt({ min: 1 }).withMessage('ID de pregunta inválido.'),
    body('respuestas.*.opcion_id')
      .optional({ checkFalsy: true })
      .isInt({ min: 1 }).withMessage('ID de opción inválido.'),
    body('respuestas.*.respuesta_texto')
      .optional({ checkFalsy: true })
      .isString().trim().isLength({ max: 2000 }).withMessage('Respuesta de texto demasiado larga.')
  ],
  handleValidationErrors,
  submitEncuesta
);

module.exports = router;
