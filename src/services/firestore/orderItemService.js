const { db } = require('../../config/firebase');

/**
 * Servicio para manejar operaciones de items de orden en Firestore
 */
class OrderItemService {
  static COLLECTION = 'orderItems';

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
   * Crear un nuevo item de orden
   */
  static async create(itemData) {
    try {
      // Calcular total
      const quantity = parseInt(itemData.quantity);
      const price = parseFloat(itemData.price);
      itemData.total = quantity * price;

      // Valores por defecto
      itemData.createdAt = new Date();
      itemData.updatedAt = new Date();

      // Convertir a números
      itemData.quantity = quantity;
      itemData.price = price;

      const docRef = await db.collection(this.COLLECTION).add(itemData);
      const doc = await docRef.get();
      
      return {
        success: true,
        data: this.docToObject(doc)
      };
    } catch (error) {
      throw new Error(`Error al crear item de orden: ${error.message}`);
    }
  }

  /**
   * Obtener item por ID
   */
  static async findById(id) {
    try {
      const doc = await db.collection(this.COLLECTION).doc(id).get();
      
      if (!doc.exists) {
        throw new Error('Item de orden no encontrado');
      }

      return {
        success: true,
        data: this.docToObject(doc)
      };
    } catch (error) {
      throw new Error(`Error al obtener item de orden: ${error.message}`);
    }
  }

  /**
   * Obtener items por orderId
   */
  static async findByOrderId(orderId) {
    try {
      const snapshot = await db.collection(this.COLLECTION)
        .where('orderId', '==', orderId)
        .orderBy('createdAt', 'asc')
        .get();

      return snapshot.docs.map(doc => this.docToObject(doc));
    } catch (error) {
      throw new Error(`Error al obtener items de orden: ${error.message}`);
    }
  }

  /**
   * Actualizar item de orden
   */
  static async update(id, updateData) {
    try {
      const docRef = db.collection(this.COLLECTION).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new Error('Item de orden no encontrado');
      }

      // Recalcular total si cambian quantity o price
      if (updateData.quantity || updateData.price) {
        const currentData = doc.data();
        const quantity = updateData.quantity !== undefined 
          ? parseInt(updateData.quantity) 
          : currentData.quantity;
        const price = updateData.price !== undefined 
          ? parseFloat(updateData.price) 
          : currentData.price;
        updateData.total = quantity * price;
      }

      updateData.updatedAt = new Date();

      // Convertir a números si existen
      if (updateData.quantity) updateData.quantity = parseInt(updateData.quantity);
      if (updateData.price) updateData.price = parseFloat(updateData.price);

      await docRef.update(updateData);
      const updatedDoc = await docRef.get();

      return {
        success: true,
        data: this.docToObject(updatedDoc)
      };
    } catch (error) {
      throw new Error(`Error al actualizar item de orden: ${error.message}`);
    }
  }

  /**
   * Eliminar item de orden
   */
  static async delete(id) {
    try {
      await db.collection(this.COLLECTION).doc(id).delete();

      return {
        success: true,
        message: 'Item de orden eliminado exitosamente'
      };
    } catch (error) {
      throw new Error(`Error al eliminar item de orden: ${error.message}`);
    }
  }
}

module.exports = OrderItemService;

