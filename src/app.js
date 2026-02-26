const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Inicializar Firebase
require('./config/firebase');
const errorHandler = require('./middleware/errorHandler');

// Importar rutas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración de rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por IP cada 15 minutos
  message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
});

// Middleware de seguridad y configuración
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(limiter);
app.use(morgan('combined'));
// Configuración de CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps o curl requests)
    if (!origin) return callback(null, true);
    
    // Lista de orígenes permitidos
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ].filter(Boolean); // Eliminar valores undefined/null
    
    // En desarrollo, permitir localhost en cualquier puerto
    if (process.env.NODE_ENV === 'development') {
      const isLocalhost = origin.startsWith('http://localhost:') || 
                         origin.startsWith('http://127.0.0.1:');
      if (isLocalhost) {
        return callback(null, true);
      }
    }
    
    // Verificar si el origen está en la lista permitida
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization']
};

app.use(cors(corsOptions));

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos
app.use('/uploads', express.static('src/uploads'));

// Rutas de la API
app.use(`/api/${process.env.API_VERSION || 'v1'}/auth`, authRoutes);
app.use(`/api/${process.env.API_VERSION || 'v1'}/users`, userRoutes);
app.use(`/api/${process.env.API_VERSION || 'v1'}/products`, productRoutes);
app.use(`/api/${process.env.API_VERSION || 'v1'}/categories`, categoryRoutes);
app.use(`/api/${process.env.API_VERSION || 'v1'}/orders`, orderRoutes);
app.use(`/api/${process.env.API_VERSION || 'v1'}/cart`, cartRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    message: 'API WebComputo Backend funcionando correctamente',
    version: process.env.API_VERSION || 'v1',
    timestamp: new Date().toISOString()
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Middleware de manejo de errores
app.use(errorHandler);

// Función para inicializar Firebase y el servidor
const startServer = async () => {
  try {
    // Firebase ya está inicializado en el require
    console.log('✅ Firebase inicializado correctamente.');
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
      console.log(`📱 API disponible en: http://localhost:${PORT}/api/${process.env.API_VERSION || 'v1'}`);
      console.log(`🔥 Usando Firebase Firestore como base de datos`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejo de cierre graceful
process.on('SIGTERM', async () => {
  console.log('🛑 Cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Cerrando servidor...');
  process.exit(0);
});

// Iniciar el servidor
startServer();

module.exports = app;

