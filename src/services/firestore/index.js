// Exportar todos los servicios de Firestore
module.exports = {
  ProductService: require('./productService'),
  UserService: require('./userService'),
  CategoryService: require('./categoryService'),
  OrderService: require('./orderService'),
  OrderItemService: require('./orderItemService'),
  CartService: require('./cartService')
};

