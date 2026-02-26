const { sequelize } = require('../config/database');

// Importar modelos
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Cart = require('./Cart');

// Definir relaciones

// Usuario - Órdenes (1:N)
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Usuario - Carrito (1:N)
User.hasMany(Cart, { foreignKey: 'userId', as: 'cartItems' });
Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Categoría - Productos (1:N)
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Producto - Carrito (1:N)
Product.hasMany(Cart, { foreignKey: 'productId', as: 'cartItems' });
Cart.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Orden - OrderItems (1:N)
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// Producto - OrderItems (1:N)
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Exportar modelos y sequelize
module.exports = {
  sequelize,
  User,
  Category,
  Product,
  Order,
  OrderItem,
  Cart
};

