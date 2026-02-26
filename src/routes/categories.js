const express = require('express');
const { body, param, query } = require('express-validator');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { handleValidationErrors, commonValidations } = require('../middleware/validation');
const { uploadCategoryImage, handleUploadError } = require('../middleware/upload');
const {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getSubcategories,
  getCategoriesWithCount
} = require('../controllers/categoryController');

const router = express.Router();

// Validaciones
const createCategoryValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres'),
  body('parentId')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      // Permite null, undefined, o string vacío
      if (value === null || value === undefined || value === '') {
        return true;
      }
      // Si se proporciona un valor, debe ser un string no vacío (ID de Firestore)
      if (typeof value === 'string' && value.trim().length > 0) {
        return true;
      }
      throw new Error('El parentId debe ser null o un string (ID de Firestore)');
    })
    .withMessage('El parentId debe ser null o un string (ID de Firestore)')
];

const updateCategoryValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres'),
  body('parentId')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      // Permite null, undefined, o string vacío
      if (value === null || value === undefined || value === '') {
        return true;
      }
      // Si se proporciona un valor, debe ser un string no vacío (ID de Firestore)
      if (typeof value === 'string' && value.trim().length > 0) {
        return true;
      }
      throw new Error('El parentId debe ser null o un string (ID de Firestore)');
    })
    .withMessage('El parentId debe ser null o un string (ID de Firestore)')
];

const queryValidation = [
  query('includeProducts')
    .optional()
    .isBoolean()
    .withMessage('includeProducts debe ser verdadero o falso'),
  query('parentOnly')
    .optional()
    .isBoolean()
    .withMessage('parentOnly debe ser verdadero o falso')
];

// Rutas públicas
router.get('/', queryValidation, handleValidationErrors, getCategories);
router.get('/with-count', getCategoriesWithCount);
router.get('/slug/:slug', queryValidation, handleValidationErrors, getCategoryBySlug);
router.get('/:id', commonValidations.validateId('id'), handleValidationErrors, getCategoryById);
router.get('/:id/subcategories', commonValidations.validateId('id'), handleValidationErrors, getSubcategories);

// Rutas protegidas (solo admin)
router.post(
  '/',
  authenticate,
  authorizeAdmin,
  uploadCategoryImage,
  handleUploadError,
  createCategoryValidation,
  handleValidationErrors,
  createCategory
);

router.put(
  '/:id',
  authenticate,
  authorizeAdmin,
  commonValidations.validateId('id'),
  uploadCategoryImage,
  handleUploadError,
  updateCategoryValidation,
  handleValidationErrors,
  updateCategory
);

router.delete(
  '/:id',
  authenticate,
  authorizeAdmin,
  commonValidations.validateId('id'),
  handleValidationErrors,
  deleteCategory
);

module.exports = router;





































