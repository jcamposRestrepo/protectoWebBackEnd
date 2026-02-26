const express = require('express');
const { body, param, query } = require('express-validator');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { handleValidationErrors, commonValidations } = require('../middleware/validation');
const {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  getOrderStats
} = require('../controllers/orderController');

const router = express.Router();

// Validaciones
const createOrderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('La orden debe contener al menos un producto'),
  body('items.*.productId')
    .isInt({ min: 1 })
    .withMessage('ID de producto inválido'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('La cantidad debe ser un número entero positivo'),
  body('shippingAddress')
    .isObject()
    .withMessage('La dirección de envío es requerida'),
  body('shippingAddress.street')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('La calle debe tener entre 5 y 200 caracteres'),
  body('shippingAddress.city')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('La ciudad debe tener entre 2 y 100 caracteres'),
  body('shippingAddress.state')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El estado debe tener entre 2 y 100 caracteres'),
  body('shippingAddress.postalCode')
    .trim()
    .isLength({ min: 5, max: 10 })
    .withMessage('El código postal debe tener entre 5 y 10 caracteres'),
  body('shippingAddress.country')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El país debe tener entre 2 y 100 caracteres'),
  body('paymentMethod')
    .isIn(['cash', 'card', 'transfer', 'paypal'])
    .withMessage('Método de pago inválido'),
  body('billingAddress')
    .optional()
    .isObject()
    .withMessage('La dirección de facturación debe ser un objeto'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Las notas no pueden exceder 500 caracteres')
];

const updateOrderStatusValidation = [
  body('status')
    .optional()
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
    .withMessage('Estado de orden inválido'),
  body('paymentStatus')
    .optional()
    .isIn(['pending', 'paid', 'failed', 'refunded'])
    .withMessage('Estado de pago inválido'),
  body('trackingNumber')
    .optional()
    .isLength({ max: 100 })
    .withMessage('El número de seguimiento no puede exceder 100 caracteres')
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
  query('status')
    .optional()
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
    .withMessage('Estado de orden inválido'),
  query('paymentStatus')
    .optional()
    .isIn(['pending', 'paid', 'failed', 'refunded'])
    .withMessage('Estado de pago inválido'),
  query('userId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de usuario inválido'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de inicio inválida'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin inválida')
];

// Rutas protegidas para usuarios
router.post(
  '/',
  authenticate,
  createOrderValidation,
  handleValidationErrors,
  createOrder
);

router.get(
  '/my-orders',
  authenticate,
  queryValidation,
  handleValidationErrors,
  getUserOrders
);

router.get(
  '/:id',
  authenticate,
  commonValidations.validateId('id'),
  handleValidationErrors,
  getOrderById
);

router.put(
  '/:id/cancel',
  authenticate,
  commonValidations.validateId('id'),
  handleValidationErrors,
  cancelOrder
);

// Rutas protegidas para administradores
router.get(
  '/admin/all',
  authenticate,
  authorizeAdmin,
  queryValidation,
  handleValidationErrors,
  getAllOrders
);

router.get(
  '/admin/stats',
  authenticate,
  authorizeAdmin,
  queryValidation,
  handleValidationErrors,
  getOrderStats
);

router.put(
  '/admin/:id/status',
  authenticate,
  authorizeAdmin,
  commonValidations.validateId('id'),
  updateOrderStatusValidation,
  handleValidationErrors,
  updateOrderStatus
);

module.exports = router;





































