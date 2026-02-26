// Constantes del sistema WebComputo

// Roles de usuario
const USER_ROLES = {
  ADMIN: 'admin',
  CLIENT: 'client'
};

// Estados de orden
const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

// Estados de pago
const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

// Métodos de pago
const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  TRANSFER: 'transfer',
  PAYPAL: 'paypal'
};

// Estados de usuario
const USER_STATUS = {
  ACTIVE: true,
  INACTIVE: false
};

// Configuración de archivos
const FILE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  UPLOAD_PATHS: {
    PRODUCTS: 'products',
    CATEGORIES: 'categories',
    AVATARS: 'avatars'
  }
};

// Configuración de paginación
const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// Configuración de validación
const VALIDATION_CONFIG = {
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  EMAIL_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 2000,
  SHORT_DESCRIPTION_MAX_LENGTH: 500
};

// Mensajes de respuesta
const RESPONSE_MESSAGES = {
  SUCCESS: {
    CREATED: 'Recurso creado exitosamente',
    UPDATED: 'Recurso actualizado exitosamente',
    DELETED: 'Recurso eliminado exitosamente',
    LOGIN: 'Login exitoso',
    LOGOUT: 'Logout exitoso',
    REGISTER: 'Usuario registrado exitosamente'
  },
  ERROR: {
    NOT_FOUND: 'Recurso no encontrado',
    UNAUTHORIZED: 'No autorizado',
    FORBIDDEN: 'Acceso denegado',
    VALIDATION_ERROR: 'Errores de validación',
    INTERNAL_ERROR: 'Error interno del servidor',
    INVALID_CREDENTIALS: 'Credenciales inválidas',
    USER_EXISTS: 'El usuario ya existe',
    INSUFFICIENT_STOCK: 'Stock insuficiente',
    INVALID_TOKEN: 'Token inválido',
    EXPIRED_TOKEN: 'Token expirado'
  }
};

// Configuración de JWT
const JWT_CONFIG = {
  EXPIRES_IN: '24h',
  REFRESH_EXPIRES_IN: '7d'
};

// Configuración de rate limiting
const RATE_LIMIT_CONFIG = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutos
  MAX_REQUESTS: 100
};

// Configuración de impuestos y envío
const BUSINESS_CONFIG = {
  TAX_RATE: 0.16, // 16% IVA
  FREE_SHIPPING_THRESHOLD: 1000, // Envío gratis a partir de $1000
  DEFAULT_SHIPPING_COST: 150
};

// Estados de productos
const PRODUCT_STATUS = {
  ACTIVE: true,
  INACTIVE: false
};

// Configuración de categorías
const CATEGORY_CONFIG = {
  MAX_SUBCATEGORIES: 3 // Máximo nivel de anidación
};

module.exports = {
  USER_ROLES,
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  USER_STATUS,
  FILE_CONFIG,
  PAGINATION_CONFIG,
  VALIDATION_CONFIG,
  RESPONSE_MESSAGES,
  JWT_CONFIG,
  RATE_LIMIT_CONFIG,
  BUSINESS_CONFIG,
  PRODUCT_STATUS,
  CATEGORY_CONFIG
};





































