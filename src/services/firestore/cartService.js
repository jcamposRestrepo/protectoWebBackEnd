const { db } = require('../../config/firebase');

/**
 * Servicio para manejar operaciones de carrito en Firestore
 */
class CartService {
  static COLLECTION = 'cart';

  /**
   * Convertir documento de Firestore a objeto JavaScript
   */
  static docToObject(doc) {
    if (!doc.exists) return null;
    return {
      id: doc.id,
      ...doc.data()
    };
  }

  /**
   * Crear o actualizar item del carrito
   */
  static async addItem(userId, productId, quantity = 1) {
    try {
      // Buscar si ya existe un item para este usuario y producto
      const existing = await this.findByUserAndProduct(userId, productId);

      if (existing) {
        // Actualizar cantidad
        const newQuantity = existing.quantity + parseInt(quantity);
        return await this.update(existing.id, { quantity: newQuantity });
      } else {
        // Crear nuevo item
        const itemData = {
          userId,
          productId,
          quantity: parseInt(quantity),
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const docRef = await db.collection(this.COLLECTION).add(itemData);
        const doc = await docRef.get();
        
        return {
          success: true,
          data: this.docToObject(doc)
        };
      }
    } catch (error) {
      throw new Error(`Error al agregar item al carrito: ${error.message}`);
    }
  }

  /**
   * Obtener item por ID
   */
  static async findById(id) {
    try {
      const doc = await db.collection(this.COLLECTION).doc(id).get();
      
      if (!doc.exists) {
        throw new Error('Item del carrito no encontrado');
      }

      return {
        success: true,
        data: this.docToObject(doc)
      };
    } catch (error) {
      throw new Error(`Error al obtener item del carrito: ${error.message}`);
    }
  }

  /**
   * Buscar item por usuario y producto
   */
  static async findByUserAndProduct(userId, productId) {
    try {
      const snapshot = await db.collection(this.COLLECTION)
        .where('userId', '==', userId)
        .where('productId', '==', productId)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      return this.docToObject(snapshot.docs[0]);
    } catch (error) {
      throw new Error(`Error al buscar item del carrito: ${error.message}`);
    }
  }

  /**
   * Obtener todos los items del carrito de un usuario
   */
  static async findByUserId(userId) {
    try {
      const snapshot = await db.collection(this.COLLECTION)
        .where('userId', '==', userId)
        .get();

      // Ordenar en código para evitar necesidad de índice compuesto
      const items = snapshot.docs.map(doc => this.docToObject(doc));
      return items.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB - dateA; // Orden descendente
      });
    } catch (error) {
      throw new Error(`Error al obtener items del carrito: ${error.message}`);
    }
  }

  /**
   * Actualizar item del carrito
   */
  static async update(id, updateData) {
    try {
      const docRef = db.collection(this.COLLECTION).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new Error('Item del carrito no encontrado');
      }

      updateData.updatedAt = new Date();

      if (updateData.quantity !== undefined) {
        updateData.quantity = parseInt(updateData.quantity);
        if (updateData.quantity <= 0) {
          // Si la cantidad es 0 o menor, eliminar el item
          return await this.delete(id);
        }
      }

      await docRef.update(updateData);
      const updatedDoc = await docRef.get();

      return {
        success: true,
        data: this.docToObject(updatedDoc)
      };
    } catch (error) {
      throw new Error(`Error al actualizar item del carrito: ${error.message}`);
    }
  }

  /**
   * Eliminar item del carrito
   */
  static async delete(id) {
    try {
      await db.collection(this.COLLECTION).doc(id).delete();

      return {
        success: true,
        message: 'Item del carrito eliminado exitosamente'
      };
    } catch (error) {
      throw new Error(`Error al eliminar item del carrito: ${error.message}`);
    }
  }

  /**
   * Limpiar carrito de un usuario
   */
  static async clearCart(userId) {
    try {
      const items = await this.findByUserId(userId);
      
      for (const item of items) {
        await this.delete(item.id);
      }

      return {
        success: true,
        message: 'Carrito limpiado exitosamente'
      };
    } catch (error) {
      throw new Error(`Error al limpiar carrito: ${error.message}`);
    }
  }

  /**
   * Obtener cantidad total de items en el carrito
   */
  static async getCartCount(userId) {
    try {
      const items = await this.findByUserId(userId);
      return items.reduce((total, item) => total + item.quantity, 0);
    } catch (error) {
      throw new Error(`Error al obtener cantidad del carrito: ${error.message}`);
    }
  }

  /**
   * Sincronizar carrito completo del usuario
   * Recibe un array de items del carrito desde el frontend y los guarda/actualiza
   * @param {string} userId - ID del usuario
   * @param {Array} cartItems - Array de items del carrito con estructura:
   *   { id, product: { id, name, price, ... }, quantity, addedAt }
   */
  static async syncCart(userId, cartItems) {
    try {
      // Primero limpiar el carrito existente del usuario
      await this.clearCart(userId);

      if (!cartItems || cartItems.length === 0) {
        return {
          success: true,
          message: 'Carrito sincronizado (vacío)',
          data: []
        };
      }

      const batch = db.batch();
      const savedItems = [];

      for (const item of cartItems) {
        const itemData = {
          userId,
          cartItemId: item.id, // ID generado en el frontend
          productId: item.product.id,
          productName: item.product.name,
          productPrice: item.product.price,
          productOriginalPrice: item.product.originalPrice || null,
          productImage: item.product.image || null,
          productCategory: item.product.category || null,
          productType: item.product.type || null,
          productInStock: item.product.inStock !== false,
          quantity: parseInt(item.quantity) || 1,
          addedAt: item.addedAt ? new Date(item.addedAt) : new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const docRef = db.collection(this.COLLECTION).doc();
        batch.set(docRef, itemData);
        savedItems.push({ id: docRef.id, ...itemData });
      }

      await batch.commit();

      return {
        success: true,
        message: 'Carrito sincronizado exitosamente',
        data: savedItems,
        itemCount: savedItems.length
      };
    } catch (error) {
      throw new Error(`Error al sincronizar carrito: ${error.message}`);
    }
  }

  /**
   * Agregar múltiples items al carrito sin borrar los existentes
   * @param {string} userId - ID del usuario
   * @param {Array} cartItems - Array de items del carrito
   */
  static async addMultipleItems(userId, cartItems) {
    try {
      if (!cartItems || cartItems.length === 0) {
        return {
          success: true,
          message: 'No hay items para agregar',
          data: []
        };
      }

      const results = [];

      for (const item of cartItems) {
        const productId = item.product?.id || item.productId;
        const quantity = parseInt(item.quantity) || 1;

        // Buscar si ya existe el producto en el carrito
        const existing = await this.findByUserAndProduct(userId, productId);

        if (existing) {
          // Actualizar cantidad
          const newQuantity = existing.quantity + quantity;
          const updated = await this.update(existing.id, { quantity: newQuantity });
          results.push(updated.data);
        } else {
          // Crear nuevo item con datos del producto
          const itemData = {
            userId,
            cartItemId: item.id,
            productId,
            productName: item.product?.name || null,
            productPrice: item.product?.price || 0,
            productOriginalPrice: item.product?.originalPrice || null,
            productImage: item.product?.image || null,
            productCategory: item.product?.category || null,
            productType: item.product?.type || null,
            productInStock: item.product?.inStock !== false,
            quantity,
            addedAt: item.addedAt ? new Date(item.addedAt) : new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          };

          const docRef = await db.collection(this.COLLECTION).add(itemData);
          const doc = await docRef.get();
          results.push(this.docToObject(doc));
        }
      }

      return {
        success: true,
        message: `${results.length} item(s) agregado(s) al carrito`,
        data: results,
        itemCount: results.length
      };
    } catch (error) {
      throw new Error(`Error al agregar items al carrito: ${error.message}`);
    }
  }
}

module.exports = CartService;

