const express = require('express');
const { body, param } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { handleValidationErrors, commonValidations } = require('../middleware/validation');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount,
  validateCart,
  // Nuevas funciones para Firestore
  syncCart,
  addMultipleToCart,
  getCartFirestore,
  clearCartFirestore,
  removeFromCartFirestore,
  updateCartItemFirestore
} = require('../controllers/cartController');

const router = express.Router();

// Validaciones
const addToCartValidation = [
  body('productId')
    .isString()
    .withMessage('ID de producto debe ser un string')
    .isLength({ min: 1, max: 128 })
    .withMessage('ID de producto debe tener entre 1 y 128 caracteres')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('ID de producto contiene caracteres no válidos'),
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La cantidad debe ser un número entero positivo')
];

const updateCartItemValidation = [
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('La cantidad debe ser un número entero positivo')
];

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas del carrito
router.get('/', getCart);
router.get('/count', getCartCount);
router.get('/validate', validateCart);

router.post(
  '/add',
  addToCartValidation,
  handleValidationErrors,
  addToCart
);

// ============================================
// RUTAS PARA FIRESTORE (sincronización desde frontend)
// IMPORTANTE: Estas rutas deben estar ANTES de las rutas con /:id
// ============================================

// Validación para items del carrito
const cartItemValidation = [
  body()
    .isArray()
    .withMessage('El cuerpo debe ser un array de items'),
  body('*.product.id')
    .isString()
    .withMessage('El ID del producto debe ser un string'),
  body('*.quantity')
    .isInt({ min: 1 })
    .withMessage('La cantidad debe ser un número entero positivo')
];

// Sincronizar carrito completo (reemplaza todo el carrito del usuario)
router.post(
  '/sync',
  cartItemValidation,
  handleValidationErrors,
  syncCart
);

// Agregar múltiples items al carrito (sin borrar los existentes)
router.post(
  '/add-multiple',
  cartItemValidation,
  handleValidationErrors,
  addMultipleToCart
);

// Obtener carrito desde Firestore
router.get('/firestore', getCartFirestore);

// Limpiar carrito en Firestore
router.delete('/firestore', clearCartFirestore);

// Eliminar item específico del carrito en Firestore
router.delete(
  '/firestore/:id',
  commonValidations.validateId('id'),
  handleValidationErrors,
  removeFromCartFirestore
);

// Actualizar cantidad de item en Firestore
router.put(
  '/firestore/:id',
  commonValidations.validateId('id'),
  updateCartItemValidation,
  handleValidationErrors,
  updateCartItemFirestore
);

// ============================================
// RUTAS CON PARÁMETROS (deben estar al final)
// ============================================

// Limpiar todo el carrito
router.delete('/', clearCartFirestore);

// Actualizar item del carrito
router.put(
  '/:id',
  commonValidations.validateId('id'),
  updateCartItemValidation,
  handleValidationErrors,
  updateCartItemFirestore
);

// Eliminar item del carrito
router.delete(
  '/:id',
  commonValidations.validateId('id'),
  handleValidationErrors,
  removeFromCartFirestore
);

module.exports = router;





































