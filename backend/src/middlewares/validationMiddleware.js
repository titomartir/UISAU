const { validationResult } = require('express-validator');

/**
 * Middleware que procesa los resultados de express-validator.
 * Si hay errores de validación, responde con 400 y lista de errores.
 * Si todo es válido, pasa al siguiente middleware.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación en los datos enviados.',
      errors: errors.array().map(e => ({
        campo: e.path,
        mensaje: e.msg,
        valor: e.value
      }))
    });
  }

  next();
};

module.exports = { handleValidationErrors };
