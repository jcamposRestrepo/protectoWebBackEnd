const { validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// Validaciones comunes
const commonValidations = {
  // Validación de ID de Firestore (string alfanumérico)
  validateId: (field = 'id') => [
    require('express-validator').param(field)
      .isString()
      .withMessage(`${field} debe ser un string`)
      .isLength({ min: 1, max: 128 })
      .withMessage(`${field} debe tener entre 1 y 128 caracteres`)
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage(`${field} contiene caracteres no válidos`)
  ],
  
  // Validación de paginación
  validatePagination: [
    require('express-validator').query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('La página debe ser un número entero positivo'),
    require('express-validator').query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('El límite debe ser un número entre 1 y 100')
  ],
  
  // Validación de email
  validateEmail: (field = 'email') => [
    require('express-validator').body(field)
      .isEmail()
      .normalizeEmail()
      .withMessage('Debe proporcionar un email válido')
  ],
  
  // Validación de contraseña
  validatePassword: (field = 'password') => [
    require('express-validator').body(field)
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('La contraseña debe contener al menos una letra minúscula, una mayúscula y un número')
  ],
  
  // Validación de precio
  validatePrice: (field = 'price') => [
    require('express-validator').body(field)
      .isDecimal({ decimal_digits: '0,2' })
      .withMessage('El precio debe ser un número decimal válido')
      .isFloat({ min: 0 })
      .withMessage('El precio debe ser mayor o igual a 0')
  ],
  
  // Validación de stock
  validateStock: (field = 'stock') => [
    require('express-validator').body(field)
      .isInt({ min: 0 })
      .withMessage('El stock debe ser un número entero mayor o igual a 0')
  ]
};

module.exports = {
  handleValidationErrors,
  commonValidations
};

