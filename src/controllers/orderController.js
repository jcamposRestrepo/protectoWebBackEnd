const { Order, OrderItem, Product, User } = require('../models');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');

// Crear nueva orden
const createOrder = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      notes
    } = req.body;

    const userId = req.user.id;

    // Validar que hay items en la orden
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'La orden debe contener al menos un producto'
      });
    }

    // Calcular totales
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Producto con ID ${item.productId} no encontrado o inactivo`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente para el producto ${product.name}. Disponible: ${product.stock}`
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal,
        productSnapshot: {
          name: product.name,
          sku: product.sku,
          price: product.price,
          images: product.images,
          brand: product.brand,
          model: product.model
        }
      });
    }

    // Calcular impuestos y envío (ejemplo básico)
    const tax = subtotal * 0.16; // 16% de IVA
    const shipping = subtotal > 1000 ? 0 : 150; // Envío gratis si es mayor a $1000
    const total = subtotal + tax + shipping;

    // Crear la orden
    const order = await Order.create({
      userId,
      subtotal,
      tax,
      shipping,
      total,
      paymentMethod,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      notes
    });

    // Crear los items de la orden
    for (const item of orderItems) {
      await OrderItem.create({
        ...item,
        orderId: order.id
      });

      // Actualizar stock del producto
      const product = await Product.findByPk(item.productId);
      await product.update({
        stock: product.stock - item.quantity
      });
    }

    // Cargar la orden completa
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'sku', 'images']
            }
          ]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente',
      data: { order: completeOrder }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener órdenes del usuario
const getUserOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const userId = req.user.id;
    const offset = (page - 1) * limit;

    const whereClause = { userId };
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'sku', 'images']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener orden por ID
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({
      where: { id, userId },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'sku', 'images', 'brand', 'model']
            }
          ]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener todas las órdenes (solo admin)
const getAllOrders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      paymentStatus,
      userId,
      startDate,
      endDate
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Filtros
    if (status) whereClause.status = status;
    if (paymentStatus) whereClause.paymentStatus = paymentStatus;
    if (userId) whereClause.userId = userId;

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
      if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'sku', 'images']
            }
          ]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar estado de orden (solo admin)
const updateOrderStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status, paymentStatus, trackingNumber } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;

    // Actualizar fechas según el estado
    if (status === 'shipped') {
      updateData.shippedAt = new Date();
    }
    if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    }

    await order.update(updateData);

    res.json({
      success: true,
      message: 'Estado de orden actualizado exitosamente',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

// Cancelar orden
const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({
      where: { id, userId },
      include: [
        {
          model: OrderItem,
          as: 'items'
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    if (!order.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'Esta orden no puede ser cancelada'
      });
    }

    // Restaurar stock de productos
    for (const item of order.items) {
      const product = await Product.findByPk(item.productId);
      if (product) {
        await product.update({
          stock: product.stock + item.quantity
        });
      }
    }

    // Actualizar estado de la orden
    await order.update({ status: 'cancelled' });

    res.json({
      success: true,
      message: 'Orden cancelada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// Obtener estadísticas de órdenes (solo admin)
const getOrderStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const whereClause = {};
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
      if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
    }

    const totalOrders = await Order.count({ where: whereClause });
    const totalRevenue = await Order.sum('total', { where: whereClause });
    
    const ordersByStatus = await Order.findAll({
      where: whereClause,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    const ordersByPaymentStatus = await Order.findAll({
      where: whereClause,
      attributes: [
        'paymentStatus',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['paymentStatus']
    });

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenue || 0,
        ordersByStatus,
        ordersByPaymentStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  getOrderStats
};





































