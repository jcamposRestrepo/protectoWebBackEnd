const { auth } = require('../config/firebase');
const { UserService } = require('../services/firestore');

// Middleware para verificar autenticación con Firebase Auth
const authenticate = async (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization || req.get('Authorization') || req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    // Extraer token (puede venir como "Bearer token" o solo "token")
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.replace('Bearer ', '').trim() 
      : authHeader.trim();
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    // Verificar token con Firebase Auth
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch (verifyError) {
      console.error('❌ Error verificando token:', verifyError.code, verifyError.message);
      // Si el error es que el token es un customToken, dar mensaje más claro
      if (verifyError.code === 'auth/argument-error' || verifyError.message.includes('custom')) {
        return res.status(401).json({
          success: false,
          message: 'El token proporcionado es un customToken. Debes intercambiarlo por un ID token usando Firebase SDK o el endpoint de login.'
        });
      }
      throw verifyError;
    }
    
    // Obtener información adicional del usuario desde Firestore
    // Firebase Auth solo guarda email, uid, etc. Los datos adicionales están en Firestore
    let userData = null;
    try {
      const userResult = await UserService.findById(decodedToken.uid);
      userData = userResult.data;
    } catch (error) {
      // Si no existe en Firestore, crear un usuario básico desde Firebase Auth
      userData = {
        id: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified || false,
        role: 'client', // Por defecto
        isActive: true,
        firstName: decodedToken.name?.split(' ')[0] || '',
        lastName: decodedToken.name?.split(' ').slice(1).join(' ') || ''
      };
    }
    
    if (!userData || !userData.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o usuario inactivo'
      });
    }

    // Agregar usuario al request
    req.user = {
      id: userData.id || decodedToken.uid,
      email: userData.email || decodedToken.email,
      role: userData.role || 'client',
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      isActive: userData.isActive !== false,
      firebaseUid: decodedToken.uid,
      emailVerified: decodedToken.email_verified || false
    };
    
    next();
  } catch (error) {
    console.error('❌ Error en autenticación:', error.code || error.message);
    console.error('Token recibido (primeros 50 chars):', token ? token.substring(0, 50) + '...' : 'null');
    
    // Mensajes más específicos según el tipo de error
    let errorMessage = 'Token inválido o expirado';
    if (error.code === 'auth/id-token-expired') {
      errorMessage = 'El token ha expirado. Por favor, inicia sesión nuevamente.';
    } else if (error.code === 'auth/argument-error') {
      errorMessage = 'El token proporcionado no es válido. Asegúrate de usar un ID token de Firebase, no un customToken.';
    } else if (error.code === 'auth/id-token-revoked') {
      errorMessage = 'El token ha sido revocado. Por favor, inicia sesión nuevamente.';
    }
    
    return res.status(401).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Middleware para verificar rol de administrador
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requieren permisos de administrador'
    });
  }
  next();
};

// Middleware para verificar rol de cliente
const authorizeClient = (req, res, next) => {
  if (req.user.role !== 'client') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requieren permisos de cliente'
    });
  }
  next();
};

// Middleware opcional de autenticación (no falla si no hay token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.get('Authorization') || req.header('Authorization');
    
    if (authHeader) {
      const token = authHeader.startsWith('Bearer ') 
        ? authHeader.replace('Bearer ', '').trim() 
        : authHeader.trim();
      
      if (token) {
        try {
          const decodedToken = await auth.verifyIdToken(token);
          let userData = null;
          
          try {
            const userResult = await UserService.findById(decodedToken.uid);
            userData = userResult.data;
          } catch (error) {
            // Usuario no existe en Firestore, usar datos de Firebase Auth
            userData = {
              id: decodedToken.uid,
              email: decodedToken.email,
              role: 'client',
              isActive: true
            };
          }
          
          if (userData && userData.isActive) {
            req.user = {
              id: userData.id || decodedToken.uid,
              email: userData.email || decodedToken.email,
              role: userData.role || 'client',
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              isActive: userData.isActive !== false,
              firebaseUid: decodedToken.uid
            };
          }
        } catch (error) {
          // Token inválido, continuar sin usuario
        }
      }
    }
    
    next();
  } catch (error) {
    // Si hay error, continuamos sin usuario autenticado
    next();
  }
};

module.exports = {
  authenticate,
  authorizeAdmin,
  authorizeClient,
  optionalAuth
};

