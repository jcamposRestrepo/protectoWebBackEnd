const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear directorio de uploads si no existe
const uploadDir = path.join(__dirname, '../uploads');
const productImagesDir = path.join(uploadDir, 'products');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(productImagesDir)) {
  fs.mkdirSync(productImagesDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = uploadDir;
    
    // Determinar el directorio según el tipo de archivo
    if (file.fieldname === 'productImages' || file.fieldname === 'images') {
      uploadPath = productImagesDir;
    } else if (file.fieldname === 'categoryImage') {
      uploadPath = path.join(uploadDir, 'categories');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
    } else if (file.fieldname === 'avatar') {
      uploadPath = path.join(uploadDir, 'avatars');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + extension;
    cb(null, filename);
  }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  // Tipos de archivo permitidos
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen (JPEG, JPG, PNG, GIF, WEBP)'));
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB por defecto
    files: 10 // Máximo 10 archivos
  },
  fileFilter: fileFilter
});

// Middleware para subir imágenes de productos
// Acepta tanto 'productImages' como 'images' para flexibilidad
const uploadProductImages = (req, res, next) => {
  // Middleware personalizado que acepta múltiples nombres de campo
  const uploadAny = upload.fields([
    { name: 'productImages', maxCount: 10 },
    { name: 'images', maxCount: 10 }
  ]);
  
  uploadAny(req, res, (err) => {
    if (err) {
      // Si es un error de campo inesperado, agregar más información
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        err.field = err.field || 'desconocido';
      }
      return next(err);
    }
    
    // Normalizar los archivos: combinar productImages e images en un solo array
    if (req.files && (req.files.productImages || req.files.images)) {
      const allFiles = [];
      if (req.files.productImages) {
        allFiles.push(...req.files.productImages);
      }
      if (req.files.images) {
        allFiles.push(...req.files.images);
      }
      // Asignar todos los archivos a req.files como array para compatibilidad
      req.files = allFiles.length > 0 ? allFiles : [];
    } else {
      // Si no hay archivos, asignar array vacío
      req.files = [];
    }
    
    next();
  });
};

// Middleware para subir imagen de categoría
const uploadCategoryImage = upload.single('categoryImage');

// Middleware para subir avatar
const uploadAvatar = upload.single('avatar');

// Middleware para manejar errores de multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande. Máximo 5MB por archivo.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Demasiados archivos. Máximo 10 archivos por solicitud.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: `Campo de archivo inesperado. Use 'productImages' o 'images' para subir imágenes de productos. Campo recibido: ${err.field || 'desconocido'}`
      });
    }
  }
  
  if (err.message.includes('Solo se permiten archivos de imagen')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next(err);
};

module.exports = {
  uploadProductImages,
  uploadCategoryImage,
  uploadAvatar,
  handleUploadError
};

