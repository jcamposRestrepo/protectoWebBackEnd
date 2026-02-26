const { db } = require('../../config/firebase');
const bcrypt = require('bcryptjs');

/**
 * Servicio para manejar operaciones de usuarios en Firestore
 */
class UserService {
  static COLLECTION = 'users';

  /**
   * Convertir documento de Firestore a objeto JavaScript
   */
  static docToObject(doc) {
    if (!doc.exists) return null;
    const data = doc.data();
    // Eliminar password del objeto
    delete data.password;
    return {
      id: doc.id,
      ...data
    };
  }

  /**
   * Crear un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @param {String} userData.id - ID del usuario (opcional, si se proporciona se usa como ID del documento)
   */
  static async create(userData) {
    try {
      // Verificar que el email no exista
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('El email ya está registrado');
      }

      // Si se proporciona un ID, usarlo (para Firebase Auth UID)
      const userId = userData.id;
      delete userData.id; // Eliminar del objeto de datos

      // Hash de la contraseña (solo si se proporciona, Firebase Auth maneja las contraseñas)
      if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(userData.password, salt);
      } else {
        // Si no hay contraseña, eliminar el campo
        delete userData.password;
      }

      // Valores por defecto
      userData.role = userData.role || 'client';
      userData.isActive = userData.isActive !== undefined ? userData.isActive : true;
      userData.emailVerified = userData.emailVerified !== undefined ? userData.emailVerified : false;
      userData.createdAt = new Date();
      userData.updatedAt = new Date();

      let docRef;
      if (userId) {
        // Crear documento con ID específico
        docRef = db.collection(this.COLLECTION).doc(userId);
        await docRef.set(userData);
      } else {
        // Crear documento con ID automático
        docRef = await db.collection(this.COLLECTION).add(userData);
      }
      
      const doc = await docRef.get();
      
      return {
        success: true,
        data: this.docToObject(doc)
      };
    } catch (error) {
      throw new Error(`Error al crear usuario: ${error.message}`);
    }
  }

  /**
   * Obtener usuario por ID
   */
  static async findById(id) {
    try {
      const doc = await db.collection(this.COLLECTION).doc(id).get();
      
      if (!doc.exists) {
        throw new Error('Usuario no encontrado');
      }

      return {
        success: true,
        data: this.docToObject(doc)
      };
    } catch (error) {
      throw new Error(`Error al obtener usuario: ${error.message}`);
    }
  }

  /**
   * Obtener usuario por email
   */
  static async findByEmail(email) {
    try {
      const snapshot = await db.collection(this.COLLECTION)
        .where('email', '==', email)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      return this.docToObject(snapshot.docs[0]);
    } catch (error) {
      throw new Error(`Error al buscar usuario por email: ${error.message}`);
    }
  }

  /**
   * Obtener usuario con contraseña (para autenticación)
   */
  static async findByEmailWithPassword(email) {
    try {
      const snapshot = await db.collection(this.COLLECTION)
        .where('email', '==', email)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      throw new Error(`Error al buscar usuario: ${error.message}`);
    }
  }

  /**
   * Obtener todos los usuarios
   */
  static async findAll(filters = {}, pagination = {}) {
    try {
      let query = db.collection(this.COLLECTION);

      // Filtros
      if (filters.role) {
        query = query.where('role', '==', filters.role);
      }

      if (filters.isActive !== undefined) {
        query = query.where('isActive', '==', filters.isActive);
      }

      // Ordenamiento
      const sortBy = filters.sortBy || 'createdAt';
      const sortOrder = filters.sortOrder || 'desc';
      query = query.orderBy(sortBy, sortOrder.toLowerCase());

      // Paginación
      const page = parseInt(pagination.page) || 1;
      const limit = parseInt(pagination.limit) || 10;
      const offset = (page - 1) * limit;

      const countSnapshot = await query.get();
      const totalItems = countSnapshot.size;

      if (offset > 0) {
        const offsetSnapshot = await query.limit(offset).get();
        const lastDoc = offsetSnapshot.docs[offsetSnapshot.docs.length - 1];
        if (lastDoc) {
          query = query.startAfter(lastDoc);
        }
      }

      query = query.limit(limit);
      const snapshot = await query.get();
      const users = snapshot.docs.map(doc => this.docToObject(doc));

      const totalPages = Math.ceil(totalItems / limit);

      return {
        success: true,
        data: {
          users,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        }
      };
    } catch (error) {
      throw new Error(`Error al obtener usuarios: ${error.message}`);
    }
  }

  /**
   * Actualizar usuario
   */
  static async update(id, updateData) {
    try {
      const docRef = db.collection(this.COLLECTION).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new Error('Usuario no encontrado');
      }

      // Si se actualiza la contraseña, hashearla
      if (updateData.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(updateData.password, salt);
      }

      // Si se actualiza el email, verificar que no exista
      if (updateData.email && updateData.email !== doc.data().email) {
        const existingUser = await this.findByEmail(updateData.email);
        if (existingUser) {
          throw new Error('El email ya está registrado');
        }
      }

      updateData.updatedAt = new Date();

      await docRef.update(updateData);
      const updatedDoc = await docRef.get();

      return {
        success: true,
        data: this.docToObject(updatedDoc)
      };
    } catch (error) {
      throw new Error(`Error al actualizar usuario: ${error.message}`);
    }
  }

  /**
   * Eliminar usuario (soft delete)
   */
  static async delete(id) {
    try {
      return await this.update(id, { isActive: false });
    } catch (error) {
      throw new Error(`Error al eliminar usuario: ${error.message}`);
    }
  }

  /**
   * Comparar contraseña
   */
  static async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }
}

module.exports = UserService;

