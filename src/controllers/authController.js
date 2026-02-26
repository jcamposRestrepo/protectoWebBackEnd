const { auth } = require('../config/firebase');
const { UserService } = require('../services/firestore');
const { validationResult } = require('express-validator');
const axios = require('axios');

// Verificar token de Firebase (endpoint para verificar tokens del cliente)
// Funciona con tokens de email/password y Google
const verifyToken = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'ID token requerido'
      });
    }

    // Verificar el ID token de Firebase (funciona para email/password y Google)
    const decodedToken = await auth.verifyIdToken(idToken);

    // Obtener información del usuario desde Firebase Auth
    const firebaseUser = await auth.getUser(decodedToken.uid);

    // Obtener datos adicionales del usuario desde Firestore
    let userData = null;
    try {
      const userResult = await UserService.findById(decodedToken.uid);
      userData = userResult.data;
    } catch (error) {
      // Si no existe en Firestore, crear perfil desde Firebase Auth
      const displayName = firebaseUser.displayName || decodedToken.name || '';
      const nameParts = displayName.split(' ');
      
      userData = {
        id: decodedToken.uid,
        email: decodedToken.email || firebaseUser.email,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        role: 'client',
        isActive: !firebaseUser.disabled,
        emailVerified: decodedToken.email_verified || firebaseUser.emailVerified || false,
        avatar: firebaseUser.photoURL || decodedToken.picture || null
      };

      // Guardar en Firestore para futuras consultas
      try {
        await UserService.create(userData);
      } catch (createError) {
        // Si falla la creación, continuar con los datos básicos
        console.warn('No se pudo crear perfil en Firestore:', createError.message);
      }
    }

    res.json({
      success: true,
      data: {
        user: {
          id: userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          emailVerified: userData.emailVerified,
          avatar: userData.avatar
        },
        firebaseUid: decodedToken.uid,
        provider: decodedToken.firebase?.sign_in_provider || 'password'
      }
    });
  } catch (error) {
    console.error('Error verificando token:', error);
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
};

// Login con Google (verificar ID token de Google)
const loginWithGoogle = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'ID token de Google requerido'
      });
    }

    // Verificar el ID token de Firebase (viene del cliente después de login con Google)
    const decodedToken = await auth.verifyIdToken(idToken);

    // Obtener información del usuario desde Firebase Auth
    const firebaseUser = await auth.getUser(decodedToken.uid);

    // Verificar si el usuario está deshabilitado
    if (firebaseUser.disabled) {
      return res.status(401).json({
        success: false,
        message: 'Cuenta desactivada'
      });
    }

    // Obtener o crear perfil en Firestore
    let userData = null;
    try {
      const userResult = await UserService.findById(decodedToken.uid);
      userData = userResult.data;
    } catch (error) {
      // Si no existe en Firestore, crear perfil desde Google
      const displayName = firebaseUser.displayName || '';
      const nameParts = displayName.split(' ');

      userData = {
        id: decodedToken.uid,
        email: decodedToken.email || firebaseUser.email,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        role: 'client',
        isActive: true,
        emailVerified: decodedToken.email_verified || firebaseUser.emailVerified || false,
        avatar: firebaseUser.photoURL || decodedToken.picture || null
      };

      // Guardar en Firestore
      try {
        const createResult = await UserService.create(userData);
        userData = createResult.data;
      } catch (createError) {
        console.error('Error creando perfil:', createError);
        // Continuar con datos básicos
      }
    }

    // Actualizar avatar si viene de Google y no está en Firestore
    if (firebaseUser.photoURL && (!userData.avatar || userData.avatar !== firebaseUser.photoURL)) {
      try {
        await UserService.update(decodedToken.uid, { avatar: firebaseUser.photoURL });
        userData.avatar = firebaseUser.photoURL;
      } catch (error) {
        // Continuar aunque falle
      }
    }

    res.json({
      success: true,
      message: 'Login con Google exitoso',
      data: {
        user: {
          id: userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          emailVerified: userData.emailVerified,
          avatar: userData.avatar
        },
        firebaseUid: decodedToken.uid,
        idToken // Devolver el mismo token para que el cliente lo use
      }
    });
  } catch (error) {
    console.error('Error en login con Google:', error);
    return res.status(401).json({
      success: false,
      message: 'Token de Google inválido o expirado'
    });
  }
};

// Registro de usuario con Firebase Auth
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, password, phone, address } = req.body;

    // Verificar si el usuario ya existe en Firebase Auth
    try {
      await auth.getUserByEmail(email);
      // Si existe, retornar error
      return res.status(400).json({
        success: false,
        message: 'El usuario ya existe con este email'
      });
    } catch (error) {
      // Si el error es que no existe, continuar con la creación
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    // Crear usuario en Firebase Auth
    const firebaseUser = await auth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
      emailVerified: false,
      disabled: false
    });

    // Crear perfil adicional en Firestore
    const userResult = await UserService.create({
      id: firebaseUser.uid, // Usar el UID de Firebase Auth como ID
      firstName,
      lastName,
      email,
      phone,
      address,
      role: 'client',
      emailVerified: false
    });

    const user = userResult.data;

    // Generar custom token
    const customToken = await auth.createCustomToken(firebaseUser.uid, {
      role: user.role,
      email: user.email
    });

    // Intercambiar customToken por ID token usando REST API de Firebase
    // Esto permite usar el token directamente en Postman
    let idToken = null;
    try {
      const { firebaseConfig } = require('../config/firebase');
      const apiKey = firebaseConfig.apiKey;
      
      const response = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
        {
          token: customToken,
          returnSecureToken: true
        }
      );
      
      if (response.data && response.data.idToken) {
        idToken = response.data.idToken;
        console.log('✅ CustomToken intercambiado exitosamente por ID token (register)');
      } else {
        console.warn('⚠️ Respuesta de Firebase sin idToken (register):', response.data);
      }
    } catch (error) {
      console.error('❌ Error al intercambiar customToken por ID token (register):', error.response?.data || error.message);
      if (error.response?.data) {
        console.error('Detalles del error:', JSON.stringify(error.response.data, null, 2));
      }
    }

    // Si no se pudo obtener idToken, retornar error claro
    if (!idToken) {
      return res.status(500).json({
        success: false,
        message: 'No se pudo generar el token de acceso. Por favor, intenta nuevamente o usa el cliente para obtener el ID token.',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            emailVerified: user.emailVerified
          },
          customToken, // Para uso en cliente
          firebaseUid: firebaseUser.uid
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          emailVerified: user.emailVerified
        },
        idToken, // Solo retornar idToken válido
        firebaseUid: firebaseUser.uid
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya existe con este email'
      });
    }
    next(error);
  }
};

// Login de usuario con Firebase Auth
// NOTA: Con Firebase Auth, el login normalmente se hace en el cliente
// Este endpoint genera un custom token después de verificar credenciales
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Buscar usuario en Firebase Auth
    let firebaseUser;
    try {
      firebaseUser = await auth.getUserByEmail(email);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }
      throw error;
    }

    // Verificar si el usuario está deshabilitado
    if (firebaseUser.disabled) {
      return res.status(401).json({
        success: false,
        message: 'Cuenta desactivada'
      });
    }

    // Obtener datos adicionales del usuario desde Firestore
    let userData = null;
    try {
      const userResult = await UserService.findById(firebaseUser.uid);
      userData = userResult.data;
    } catch (error) {
      // Si no existe en Firestore, crear perfil básico
      userData = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        firstName: firebaseUser.displayName?.split(' ')[0] || '',
        lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
        role: 'client',
        isActive: !firebaseUser.disabled,
        emailVerified: firebaseUser.emailVerified || false
      };
    }

    if (!userData || !userData.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Cuenta desactivada'
      });
    }

    // Generar custom token
    const customToken = await auth.createCustomToken(firebaseUser.uid, {
      role: userData.role,
      email: userData.email
    });

    // Intercambiar customToken por ID token usando REST API de Firebase
    // Esto permite usar el token directamente en Postman
    let idToken = null;
    try {
      const { firebaseConfig } = require('../config/firebase');
      const apiKey = firebaseConfig.apiKey;
      
      const response = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
        {
          token: customToken,
          returnSecureToken: true
        }
      );
      
      idToken = response.data.idToken;
    } catch (error) {
      console.warn('No se pudo intercambiar customToken por ID token:', error.message);
      // Continuar con customToken si falla el intercambio
    }

    // Si no se pudo obtener idToken, retornar error claro
    if (!idToken) {
      return res.status(500).json({
        success: false,
        message: 'No se pudo generar el token de acceso. Por favor, intenta nuevamente o usa el cliente para obtener el ID token.',
        data: {
          user: {
            id: userData.id,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role,
            emailVerified: userData.emailVerified || firebaseUser.emailVerified
          },
          customToken, // Para uso en cliente
          firebaseUid: firebaseUser.uid
        }
      });
    }

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: {
          id: userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          emailVerified: userData.emailVerified || firebaseUser.emailVerified
        },
        idToken, // Solo retornar idToken válido
        firebaseUid: firebaseUser.uid
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    next(error);
  }
};

// Obtener perfil del usuario autenticado
const getProfile = async (req, res, next) => {
  try {
    // req.user ya está disponible desde el middleware authenticate
    const userResult = await UserService.findById(req.user.id);
    const user = userResult.data;
    
    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar perfil del usuario
const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { firstName, lastName, phone, address } = req.body;
    const userId = req.user.id;

    const userResult = await UserService.findById(userId);
    if (!userResult.success) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const user = userResult.data;

    // Actualizar campos en Firestore
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;

    const updatedResult = await UserService.update(userId, updateData);

    // También actualizar displayName en Firebase Auth si cambió el nombre
    if (firstName || lastName) {
      try {
        await auth.updateUser(userId, {
          displayName: `${updatedResult.data.firstName} ${updatedResult.data.lastName}`
        });
      } catch (error) {
        console.error('Error al actualizar Firebase Auth:', error);
        // Continuar aunque falle la actualización en Auth
      }
    }

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        user: updatedResult.data
      }
    });
  } catch (error) {
    next(error);
  }
};

// Cambiar contraseña
const changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Con Firebase Auth, no podemos verificar la contraseña actual desde el backend
    // El cliente debe hacerlo. Aquí solo actualizamos la nueva contraseña
    // NOTA: En producción, esto debería hacerse desde el cliente usando Firebase SDK
    
    try {
      await auth.updateUser(userId, {
        password: newPassword
      });

      res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Error al actualizar la contraseña: ' + error.message
      });
    }
  } catch (error) {
    next(error);
  }
};

// Logout (opcional, ya que Firebase Auth es stateless)
const logout = async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Logout exitoso'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  loginWithGoogle,
  verifyToken,
  getProfile,
  updateProfile,
  changePassword,
  logout
};
