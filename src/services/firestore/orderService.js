const { db } = require('../../config/firebase');
const OrderItemService = require('./orderItemService');

/**
 * Servicio para manejar operaciones de órdenes en Firestore
 */
class OrderService {
  static COLLECTION = 'orders';
  static SUBCOLLECTION = 'items';

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
   * Generar número de orden único
   */
  static generateOrderNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `WC${timestamp}${random}`;
  }

  /**
   * Crear una nueva orden
   */
  static async create(orderData) {
    try {
      // Generar número de orden
      if (!orderData.orderNumber) {
        orderData.orderNumber = this.generateOrderNumber();
      }

      // Valores por defecto
      orderData.status = orderData.status || 'pending';
      orderData.paymentStatus = orderData.paymentStatus || 'pending';
      orderData.tax = orderData.tax || 0;
      orderData.shipping = orderData.shipping || 0;
      orderData.createdAt = new Date();
      orderData.updatedAt = new Date();

      // Si no hay billingAddress, usar shippingAddress
      if (!orderData.billingAddress) {
        orderData.billingAddress = orderData.shippingAddress;
      }

      // Convertir montos a números
      orderData.subtotal = parseFloat(orderData.subtotal);
      orderData.tax = parseFloat(orderData.tax);
      orderData.shipping = parseFloat(orderData.shipping);
      orderData.total = parseFloat(orderData.total);

      // Crear la orden
      const docRef = await db.collection(this.COLLECTION).add(orderData);
      const orderId = docRef.id;

      // Crear items de la orden si se proporcionan
      if (orderData.items && Array.isArray(orderData.items)) {
        for (const item of orderData.items) {
          await OrderItemService.create({
            ...item,
            orderId: orderId
          });
        }
      }

      const doc = await docRef.get();
      const order = this.docToObject(doc);

      // Cargar items
      order.items = await OrderItemService.findByOrderId(orderId);

      return {
        success: true,
        data: order
      };
    } catch (error) {
      throw new Error(`Error al crear orden: ${error.message}`);
    }
  }

  /**
   * Obtener orden por ID
   */
  static async findById(id) {
    try {
      const doc = await db.collection(this.COLLECTION).doc(id).get();
      
      if (!doc.exists) {
        throw new Error('Orden no encontrada');
      }

      const order = this.docToObject(doc);
      
      // Cargar items
      order.items = await OrderItemService.findByOrderId(id);

      return {
        success: true,
        data: order
      };
    } catch (error) {
      throw new Error(`Error al obtener orden: ${error.message}`);
    }
  }

  /**
   * Obtener orden por número de orden
   */
  static async findByOrderNumber(orderNumber) {
    try {
      const snapshot = await db.collection(this.COLLECTION)
        .where('orderNumber', '==', orderNumber)
        .limit(1)
        .get();

      if (snapshot.empty) {
        throw new Error('Orden no encontrada');
      }

      const order = this.docToObject(snapshot.docs[0]);
      order.items = await OrderItemService.findByOrderId(order.id);

      return {
        success: true,
        data: order
      };
    } catch (error) {
      throw new Error(`Error al obtener orden: ${error.message}`);
    }
  }

  /**
   * Obtener órdenes de un usuario
   */
  static async findByUserId(userId, filters = {}, pagination = {}) {
    try {
      let query = db.collection(this.COLLECTION)
        .where('userId', '==', userId);

      // Filtros
      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }

      if (filters.paymentStatus) {
        query = query.where('paymentStatus', '==', filters.paymentStatus);
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
      const orders = snapshot.docs.map(doc => this.docToObject(doc));

      // Cargar items para cada orden
      for (const order of orders) {
        order.items = await OrderItemService.findByOrderId(order.id);
      }

      const totalPages = Math.ceil(totalItems / limit);

      return {
        success: true,
        data: {
          orders,
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
      throw new Error(`Error al obtener órdenes: ${error.message}`);
    }
  }

  /**
   * Obtener todas las órdenes (admin)
   */
  static async findAll(filters = {}, pagination = {}) {
    try {
      let query = db.collection(this.COLLECTION);

      // Filtros
      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }

      if (filters.paymentStatus) {
        query = query.where('paymentStatus', '==', filters.paymentStatus);
      }

      if (filters.userId) {
        query = query.where('userId', '==', filters.userId);
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
      const orders = snapshot.docs.map(doc => this.docToObject(doc));

      // Cargar items para cada orden
      for (const order of orders) {
        order.items = await OrderItemService.findByOrderId(order.id);
      }

      const totalPages = Math.ceil(totalItems / limit);

      return {
        success: true,
        data: {
          orders,
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
      throw new Error(`Error al obtener órdenes: ${error.message}`);
    }
  }

  /**
   * Actualizar orden
   */
  static async update(id, updateData) {
    try {
      const docRef = db.collection(this.COLLECTION).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new Error('Orden no encontrada');
      }

      updateData.updatedAt = new Date();

      // Convertir montos a números si existen
      if (updateData.subtotal) updateData.subtotal = parseFloat(updateData.subtotal);
      if (updateData.tax) updateData.tax = parseFloat(updateData.tax);
      if (updateData.shipping) updateData.shipping = parseFloat(updateData.shipping);
      if (updateData.total) updateData.total = parseFloat(updateData.total);

      await docRef.update(updateData);
      const updatedDoc = await docRef.get();
      const order = this.docToObject(updatedDoc);

      // Cargar items
      order.items = await OrderItemService.findByOrderId(id);

      return {
        success: true,
        data: order
      };
    } catch (error) {
      throw new Error(`Error al actualizar orden: ${error.message}`);
    }
  }

  /**
   * Eliminar orden
   */
  static async delete(id) {
    try {
      // Eliminar items primero
      const items = await OrderItemService.findByOrderId(id);
      for (const item of items) {
        await OrderItemService.delete(item.id);
      }

      // Eliminar orden
      await db.collection(this.COLLECTION).doc(id).delete();

      return {
        success: true,
        message: 'Orden eliminada exitosamente'
      };
    } catch (error) {
      throw new Error(`Error al eliminar orden: ${error.message}`);
    }
  }
}

module.exports = OrderService;

