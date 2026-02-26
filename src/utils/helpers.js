// Funciones auxiliares para el proyecto WebComputo

/**
 * Generar slug a partir de un texto
 * @param {string} text - Texto a convertir en slug
 * @returns {string} - Slug generado
 */
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

/**
 * Formatear precio para mostrar
 * @param {number} price - Precio a formatear
 * @param {string} currency - Moneda (por defecto MXN)
 * @returns {string} - Precio formateado
 */
const formatPrice = (price, currency = 'MXN') => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency
  }).format(price);
};

/**
 * Generar número de orden único
 * @returns {string} - Número de orden generado
 */
const generateOrderNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `WC${timestamp}${random}`;
};

/**
 * Validar formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} - True si es válido
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validar formato de teléfono mexicano
 * @param {string} phone - Teléfono a validar
 * @returns {boolean} - True si es válido
 */
const isValidMexicanPhone = (phone) => {
  const phoneRegex = /^(\+52|52)?[\s-]?[1-9][0-9]{9}$/;
  return phoneRegex.test(phone);
};

/**
 * Calcular descuento porcentual
 * @param {number} originalPrice - Precio original
 * @param {number} salePrice - Precio de venta
 * @returns {number} - Porcentaje de descuento
 */
const calculateDiscountPercentage = (originalPrice, salePrice) => {
  if (originalPrice <= salePrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

/**
 * Generar código de verificación
 * @param {number} length - Longitud del código
 * @returns {string} - Código generado
 */
const generateVerificationCode = (length = 6) => {
  const chars = '0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Formatear fecha para mostrar
 * @param {Date} date - Fecha a formatear
 * @param {string} locale - Locale (por defecto es-MX)
 * @returns {string} - Fecha formateada
 */
const formatDate = (date, locale = 'es-MX') => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

/**
 * Sanitizar texto para prevenir XSS
 * @param {string} text - Texto a sanitizar
 * @returns {string} - Texto sanitizado
 */
const sanitizeText = (text) => {
  if (typeof text !== 'string') return text;
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Generar paginación
 * @param {number} page - Página actual
 * @param {number} limit - Elementos por página
 * @param {number} total - Total de elementos
 * @returns {object} - Información de paginación
 */
const generatePagination = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null
  };
};

/**
 * Generar respuesta estándar de la API
 * @param {boolean} success - Indica si la operación fue exitosa
 * @param {string} message - Mensaje de respuesta
 * @param {any} data - Datos de respuesta
 * @param {object} pagination - Información de paginación (opcional)
 * @returns {object} - Respuesta formateada
 */
const generateResponse = (success, message, data = null, pagination = null) => {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  if (pagination) {
    response.pagination = pagination;
  }

  return response;
};

module.exports = {
  generateSlug,
  formatPrice,
  generateOrderNumber,
  isValidEmail,
  isValidMexicanPhone,
  calculateDiscountPercentage,
  generateVerificationCode,
  formatDate,
  sanitizeText,
  generatePagination,
  generateResponse
};





































