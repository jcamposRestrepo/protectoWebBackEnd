const express = require('express');
const { body, param, query } = require('express-validator');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { handleValidationErrors, commonValidations } = require('../middleware/validation');
const { uploadProductImages, handleUploadError } = require('../middleware/upload');
const {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getRelatedProducts,
  getAdminProducts,
  getProductStats
} = require('../controllers/productController');

const router = express.Router();

// Validaciones
const createProductValidation = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('El nombre debe tener entre 3 y 200 caracteres'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo'),
  body('sku')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('El SKU debe tener entre 3 y 100 caracteres'),
  body('categoryId')
    .notEmpty()
    .withMessage('Debe seleccionar una categoría válida')
    .isString()
    .withMessage('El categoryId debe ser un string (ID de Firestore)'),
  body('productType')
    .notEmpty()
    .withMessage('El tipo de producto es requerido')
    .isIn(['componente', 'computadora'])
    .withMessage('El tipo de producto debe ser "componente" o "computadora"'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El stock debe ser un número entero positivo')
];

const updateProductValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('El nombre debe tener entre 3 y 200 caracteres'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo'),
  body('sku')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('El SKU debe tener entre 3 y 100 caracteres'),
  body('productType')
    .optional()
    .isIn(['componente', 'computadora'])
    .withMessage('El tipo de producto debe ser "componente" o "computadora"'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El stock debe ser un número entero positivo')
];

// Rutas públicas
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id/related', commonValidations.validateId('id'), handleValidationErrors, getRelatedProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', commonValidations.validateId('id'), handleValidationErrors, getProductById);

// Rutas de administrador
router.get('/admin/all', authenticate, authorizeAdmin, getAdminProducts);
router.get('/admin/stats', authenticate, authorizeAdmin, getProductStats);

// Rutas protegidas (solo admin)
router.post(
  '/',
  authenticate,
  authorizeAdmin,
  uploadProductImages,
  handleUploadError,
  createProductValidation,
  handleValidationErrors,
  createProduct
);

router.put(
  '/:id',
  authenticate,
  authorizeAdmin,
  commonValidations.validateId('id'),
  uploadProductImages,
  handleUploadError,
  updateProductValidation,
  handleValidationErrors,
  updateProduct
);

router.delete(
  '/:id',
  authenticate,
  authorizeAdmin,
  commonValidations.validateId('id'),
  handleValidationErrors,
  deleteProduct
);

module.exports = router;






