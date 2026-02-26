const { Cart, Product } = require('../models');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const CartService = require('../services/firestore/cartService');

// Obtener carrito del usuario
const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const cartItems = await Cart.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          as: 'product',
          where: { isActive: true },
          required: true,
          attributes: ['id', 'name', 'price', 'images', 'stock', 'sku', 'brand']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Calcular totales
    let subtotal = 0;
    const items = cartItems.map(item => {
      const itemTotal = item.product.price * item.quantity;
      subtotal += itemTotal;
      
      return {
        id: item.id,
        quantity: item.quantity,
        product: item.product,
        total: itemTotal
      };
    });

    res.json({
      success: true,
      data: {
        items,
        subtotal,
        itemCount: cartItems.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// Agregar producto al carrito
const addToCart = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { productId, quantity = 1 } = req.body;
    const userId = req.user.id;

    // Verificar que el producto existe y está activo
    const product = await Product.findByPk(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado o inactivo'
      });
    }

    // Verificar stock disponible
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Stock insuficiente. Disponible: ${product.stock}`
      });
    }

    // Buscar si el producto ya está en el carrito
    const existingCartItem = await Cart.findOne({
      where: { userId, productId }
    });

    if (existingCartItem) {
      // Actualizar cantidad
      const newQuantity = existingCartItem.quantity + quantity;
      
      if (product.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente. Disponible: ${product.stock}`
        });
      }

      await existingCartItem.update({ quantity: newQuantity });
    } else {
      // Crear nuevo item en el carrito
      await Cart.create({
        userId,
        productId,
        quantity
      });
    }

    res.json({
      success: true,
      message: 'Producto agregado al carrito exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar cantidad en el carrito
const updateCartItem = async (req, res, next) => {
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
    const { quantity } = req.body;
    const userId = req.user.id;

    const cartItem = await Cart.findOne({
      where: { id, userId },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'stock']
        }
      ]
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Item del carrito no encontrado'
      });
    }

    // Verificar stock disponible
    if (cartItem.product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Stock insuficiente. Disponible: ${cartItem.product.stock}`
      });
    }

    await cartItem.update({ quantity });

    res.json({
      success: true,
      message: 'Cantidad actualizada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar item del carrito
const removeFromCart = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const cartItem = await Cart.findOne({
      where: { id, userId }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Item del carrito no encontrado'
      });
    }

    await cartItem.destroy();

    res.json({
      success: true,
      message: 'Producto eliminado del carrito exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// Limpiar carrito
const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await Cart.destroy({
      where: { userId }
    });

    res.json({
      success: true,
      message: 'Carrito limpiado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// Obtener conteo de items en el carrito
const getCartCount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const count = await Cart.count({
      where: { userId },
      include: [
        {
          model: Product,
          as: 'product',
          where: { isActive: true },
          required: true
        }
      ]
    });

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    next(error);
  }
};

// Validar carrito antes del checkout
const validateCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const cartItems = await Cart.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          as: 'product',
          where: { isActive: true },
          required: true
        }
      ]
    });

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El carrito está vacío'
      });
    }

    const errors = [];
    let subtotal = 0;

    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        errors.push({
          productId: item.productId,
          productName: item.product.name,
          message: `Stock insuficiente. Disponible: ${item.product.stock}, Solicitado: ${item.quantity}`
        });
      } else {
        subtotal += item.product.price * item.quantity;
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Hay problemas con algunos productos en el carrito',
        errors,
        subtotal
      });
    }

    res.json({
      success: true,
      message: 'Carrito válido para checkout',
      data: {
        itemCount: cartItems.length,
        subtotal
      }
    });
  } catch (error) {
    next(error);
  }
};

// Sincronizar carrito completo desde el frontend (usando Firestore)
const syncCart = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const cartItems = req.body; // Array de items del carrito

    if (!Array.isArray(cartItems)) {
      return res.status(400).json({
        success: false,
        message: 'El cuerpo de la solicitud debe ser un array de items del carrito'
      });
    }

    const result = await CartService.syncCart(userId, cartItems);

    res.json({
      success: true,
      message: result.message,
      data: {
        items: result.data,
        itemCount: result.itemCount || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// Agregar múltiples items al carrito (usando Firestore)
const addMultipleToCart = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const cartItems = req.body; // Array de items del carrito

    if (!Array.isArray(cartItems)) {
      return res.status(400).json({
        success: false,
        message: 'El cuerpo de la solicitud debe ser un array de items del carrito'
      });
    }

    const result = await CartService.addMultipleItems(userId, cartItems);

    res.json({
      success: true,
      message: result.message,
      data: {
        items: result.data,
        itemCount: result.itemCount || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener carrito desde Firestore
const getCartFirestore = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const items = await CartService.findByUserId(userId);

    // Calcular totales
    let subtotal = 0;
    const formattedItems = items.map(item => {
      const itemTotal = (item.productPrice || 0) * item.quantity;
      subtotal += itemTotal;
      
      return {
        id: item.id,
        cartItemId: item.cartItemId,
        quantity: item.quantity,
        addedAt: item.addedAt,
        product: {
          id: item.productId,
          name: item.productName,
          price: item.productPrice,
          originalPrice: item.productOriginalPrice,
          image: item.productImage,
          category: item.productCategory,
          type: item.productType,
          inStock: item.productInStock
        },
        total: itemTotal
      };
    });

    res.json({
      success: true,
      data: {
        items: formattedItems,
        subtotal,
        itemCount: items.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// Limpiar carrito en Firestore
const clearCartFirestore = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await CartService.clearCart(userId);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar item del carrito en Firestore
const removeFromCartFirestore = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar que el item pertenece al usuario
    const itemResult = await CartService.findById(id);
    
    if (!itemResult || !itemResult.data) {
      return res.status(404).json({
        success: false,
        message: 'Item del carrito no encontrado'
      });
    }

    // Verificar que el item pertenece al usuario actual
    if (itemResult.data.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar este item'
      });
    }

    const result = await CartService.delete(id);

    res.json({
      success: true,
      message: 'Producto eliminado del carrito exitosamente'
    });
  } catch (error) {
    // Si el error es "Item del carrito no encontrado", devolver 404
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({
        success: false,
        message: 'Item del carrito no encontrado'
      });
    }
    next(error);
  }
};

// Actualizar cantidad de item en Firestore
const updateCartItemFirestore = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    // Verificar que el item pertenece al usuario
    const itemResult = await CartService.findById(id);
    
    if (!itemResult || !itemResult.data) {
      return res.status(404).json({
        success: false,
        message: 'Item del carrito no encontrado'
      });
    }

    if (itemResult.data.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para modificar este item'
      });
    }

    const result = await CartService.update(id, { quantity: parseInt(quantity) });

    res.json({
      success: true,
      message: 'Cantidad actualizada exitosamente',
      data: result.data
    });
  } catch (error) {
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({
        success: false,
        message: 'Item del carrito no encontrado'
      });
    }
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount,
  validateCart,
  // Nuevas funciones para Firestore
  syncCart,
  addMultipleToCart,
  getCartFirestore,
  clearCartFirestore,
  removeFromCartFirestore,
  updateCartItemFirestore
};





































