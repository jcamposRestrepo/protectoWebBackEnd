const express = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { handleValidationErrors, commonValidations } = require('../middleware/validation');
const {
  register,
  login,
  loginWithGoogle,
  verifyToken,
  getProfile,
  updateProfile,
  changePassword,
  logout
} = require('../controllers/authController');

const router = express.Router();

// Validaciones
const registerValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe proporcionar un email válido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una letra minúscula, una mayúscula y un número'),
  body('phone')
    .optional()
    .isMobilePhone('es-MX')
    .withMessage('Debe proporcionar un número de teléfono válido'),
  body('address')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La dirección no puede exceder 500 caracteres')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe proporcionar un email válido'),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
];

const updateProfileValidation = [
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
  body('phone')
    .optional()
    .isMobilePhone('es-MX')
    .withMessage('Debe proporcionar un número de teléfono válido'),
  body('address')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La dirección no puede exceder 500 caracteres')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La nueva contraseña debe contener al menos una letra minúscula, una mayúscula y un número')
];

// Rutas públicas
router.post('/register', registerValidation, handleValidationErrors, register);
router.post('/login', loginValidation, handleValidationErrors, login);
router.post('/login/google', loginWithGoogle); // Login con Google (requiere ID token)
router.post('/verify-token', verifyToken); // Verificar ID token de Firebase (email/password o Google)

// Rutas protegidas
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfileValidation, handleValidationErrors, updateProfile);
router.put('/change-password', authenticate, changePasswordValidation, handleValidationErrors, changePassword);
router.post('/logout', authenticate, logout);

module.exports = router;

