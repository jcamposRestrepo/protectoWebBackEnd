const express = require('express');
const { body, param, query } = require('express-validator');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { handleValidationErrors, commonValidations } = require('../middleware/validation');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
  changeUserRole,
  toggleUserStatus
} = require('../controllers/userController');

const router = express.Router();

// Validaciones
const updateUserValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe proporcionar un email válido'),
  body('phone')
    .optional()
    .isMobilePhone('es-MX')
    .withMessage('Debe proporcionar un número de teléfono válido'),
  body('address')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La dirección no puede exceder 500 caracteres'),
  body('role')
    .optional()
    .isIn(['admin', 'client'])
    .withMessage('El rol debe ser admin o client'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('El estado activo debe ser verdadero o falso')
];

const changeRoleValidation = [
  body('role')
    .isIn(['admin', 'client'])
    .withMessage('El rol debe ser admin o client')
];

const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entre 1 y 100'),
  query('role')
    .optional()
    .isIn(['admin', 'client'])
    .withMessage('El rol debe ser admin o client'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser verdadero o falso'),
  query('search')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('La búsqueda debe tener entre 2 y 100 caracteres'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de inicio inválida'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin inválida')
];

// Todas las rutas requieren autenticación y permisos de admin
router.use(authenticate);
router.use(authorizeAdmin);

// Rutas de administración de usuarios
router.get('/', queryValidation, handleValidationErrors, getAllUsers);
router.get('/stats', queryValidation, handleValidationErrors, getUserStats);
router.get('/:id', commonValidations.validateId('id'), handleValidationErrors, getUserById);

router.put(
  '/:id',
  commonValidations.validateId('id'),
  updateUserValidation,
  handleValidationErrors,
  updateUser
);

router.put(
  '/:id/role',
  commonValidations.validateId('id'),
  changeRoleValidation,
  handleValidationErrors,
  changeUserRole
);

router.put(
  '/:id/toggle-status',
  commonValidations.validateId('id'),
  handleValidationErrors,
  toggleUserStatus
);

router.delete(
  '/:id',
  commonValidations.validateId('id'),
  handleValidationErrors,
  deleteUser
);

module.exports = router;





































