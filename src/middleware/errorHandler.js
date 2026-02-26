const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log del error
  console.error('Error:', err);

  // Error de Sequelize - Validación
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map(error => error.message).join(', ');
    error = {
      message,
      statusCode: 400
    };
  }

  // Error de Sequelize - Clave duplicada
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0].path;
    const message = `${field} ya existe`;
    error = {
      message,
      statusCode: 400
    };
  }

  // Error de Sequelize - Clave foránea
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    const message = 'Referencia inválida en la base de datos';
    error = {
      message,
      statusCode: 400
    };
  }

  // Error de Sequelize - Registro no encontrado
  if (err.name === 'SequelizeEmptyResultError') {
    const message = 'Registro no encontrado';
    error = {
      message,
      statusCode: 404
    };
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token inválido';
    error = {
      message,
      statusCode: 401
    };
  }

  // Error de JWT expirado
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expirado';
    error = {
      message,
      statusCode: 401
    };
  }

  // Error de multer (archivos)
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'El archivo es demasiado grande';
    error = {
      message,
      statusCode: 400
    };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Campo de archivo inesperado';
    error = {
      message,
      statusCode: 400
    };
  }

  // Error de sintaxis JSON
  if (err.type === 'entity.parse.failed') {
    const message = 'JSON inválido';
    error = {
      message,
      statusCode: 400
    };
  }

  // Error por defecto del servidor
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Error interno del servidor';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;

