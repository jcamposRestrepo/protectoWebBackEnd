# WebComputo Backend

Backend completo para una página de venta de computo y piezas de PC con roles de administrador y cliente, desarrollado con Node.js, Express y MySQL.

## 🚀 Características

- **Sistema de Autenticación**: JWT con roles de administrador y cliente
- **Gestión de Productos**: CRUD completo con categorías, imágenes y especificaciones
- **Sistema de Órdenes**: Proceso completo de compra con seguimiento
- **Carrito de Compras**: Gestión de productos en carrito
- **Gestión de Usuarios**: Administración completa de usuarios
- **Subida de Archivos**: Manejo de imágenes para productos y categorías
- **Validación**: Validación robusta de datos de entrada
- **Seguridad**: Rate limiting, helmet, CORS configurado
- **Base de Datos**: MySQL con Sequelize ORM

## 📋 Requisitos

- Node.js (v14 o superior)
- MySQL (v8.0 o superior)
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd webcomputo-backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp env.example .env
```

Editar el archivo `.env` con tus configuraciones:
```env
# Puerto del servidor
PORT=3000

# Configuración de la base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=webcomputo_db
DB_USER=root
DB_PASSWORD=tu_password_aqui

# Configuración de JWT
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
JWT_EXPIRES_IN=24h

# Configuración de archivos
UPLOAD_PATH=./src/uploads
MAX_FILE_SIZE=5242880

# Configuración de la aplicación
NODE_ENV=development
API_VERSION=v1

# URL del frontend
FRONTEND_URL=http://localhost:3001
```

4. **Crear la base de datos**
```sql
CREATE DATABASE webcomputo_db;
```

5. **Ejecutar migraciones**
```bash
npm run migrate
```

6. **Ejecutar seeders (datos iniciales)**
```bash
npm run seed
```

7. **Iniciar el servidor**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📁 Estructura del Proyecto

```
src/
├── app.js                 # Archivo principal de la aplicación
├── config/
│   ├── database.js        # Configuración de la base de datos
│   └── jwt.js            # Configuración de JWT
├── controllers/
│   ├── authController.js  # Controlador de autenticación
│   ├── userController.js  # Controlador de usuarios
│   ├── productController.js # Controlador de productos
│   ├── categoryController.js # Controlador de categorías
│   ├── orderController.js # Controlador de órdenes
│   └── cartController.js  # Controlador del carrito
├── middleware/
│   ├── auth.js           # Middleware de autenticación
│   ├── validation.js     # Middleware de validación
│   ├── errorHandler.js   # Manejo de errores
│   └── upload.js         # Middleware para subir archivos
├── models/
│   ├── index.js          # Índice de modelos
│   ├── User.js           # Modelo de usuario
│   ├── Product.js        # Modelo de producto
│   ├── Category.js       # Modelo de categoría
│   ├── Order.js          # Modelo de orden
│   ├── OrderItem.js      # Modelo de item de orden
│   └── Cart.js           # Modelo de carrito
├── routes/
│   ├── auth.js           # Rutas de autenticación
│   ├── users.js          # Rutas de usuarios
│   ├── products.js       # Rutas de productos
│   ├── categories.js     # Rutas de categorías
│   ├── orders.js         # Rutas de órdenes
│   └── cart.js           # Rutas del carrito
├── utils/
│   ├── helpers.js        # Funciones auxiliares
│   └── constants.js      # Constantes del sistema
└── uploads/              # Carpeta para archivos subidos
    └── products/         # Imágenes de productos

config/
├── config.json           # Configuración de Sequelize CLI

migrations/               # Migraciones de la base de datos
seeders/                  # Datos de prueba
```

## 🔗 API Endpoints

### Autenticación
- `POST /api/v1/auth/register` - Registro de usuario
- `POST /api/v1/auth/login` - Login de usuario
- `GET /api/v1/auth/profile` - Obtener perfil (requiere auth)
- `PUT /api/v1/auth/profile` - Actualizar perfil (requiere auth)
- `PUT /api/v1/auth/change-password` - Cambiar contraseña (requiere auth)

### Productos
- `GET /api/v1/products` - Listar productos (público)
- `GET /api/v1/products/featured` - Productos destacados (público)
- `GET /api/v1/products/:id` - Obtener producto por ID (público)
- `GET /api/v1/products/slug/:slug` - Obtener producto por slug (público)
- `POST /api/v1/products` - Crear producto (admin)
- `PUT /api/v1/products/:id` - Actualizar producto (admin)
- `DELETE /api/v1/products/:id` - Eliminar producto (admin)

### Categorías
- `GET /api/v1/categories` - Listar categorías (público)
- `GET /api/v1/categories/:id` - Obtener categoría por ID (público)
- `POST /api/v1/categories` - Crear categoría (admin)
- `PUT /api/v1/categories/:id` - Actualizar categoría (admin)
- `DELETE /api/v1/categories/:id` - Eliminar categoría (admin)

### Carrito
- `GET /api/v1/cart` - Obtener carrito (requiere auth)
- `POST /api/v1/cart/add` - Agregar al carrito (requiere auth)
- `PUT /api/v1/cart/:id` - Actualizar cantidad (requiere auth)
- `DELETE /api/v1/cart/:id` - Eliminar del carrito (requiere auth)
- `DELETE /api/v1/cart` - Limpiar carrito (requiere auth)

### Órdenes
- `POST /api/v1/orders` - Crear orden (requiere auth)
- `GET /api/v1/orders/my-orders` - Mis órdenes (requiere auth)
- `GET /api/v1/orders/:id` - Obtener orden por ID (requiere auth)
- `PUT /api/v1/orders/:id/cancel` - Cancelar orden (requiere auth)

### Usuarios (Admin)
- `GET /api/v1/users` - Listar usuarios (admin)
- `GET /api/v1/users/:id` - Obtener usuario por ID (admin)
- `PUT /api/v1/users/:id` - Actualizar usuario (admin)
- `DELETE /api/v1/users/:id` - Eliminar usuario (admin)

## 👤 Usuarios por Defecto

Después de ejecutar los seeders, tendrás un usuario administrador:

- **Email**: admin@webcomputo.com
- **Contraseña**: admin123
- **Rol**: Administrador

## 🔧 Scripts Disponibles

```bash
npm start          # Iniciar servidor en producción
npm run dev        # Iniciar servidor en desarrollo con nodemon
npm run migrate    # Ejecutar migraciones
npm run seed       # Ejecutar seeders
npm test           # Ejecutar pruebas
```

## 🛡️ Seguridad

- Autenticación JWT
- Rate limiting (100 requests por 15 minutos)
- Validación de entrada con express-validator
- Sanitización de datos
- Helmet para headers de seguridad
- CORS configurado

## 📝 Notas Importantes

1. **Base de Datos**: Asegúrate de tener MySQL instalado y configurado
2. **Variables de Entorno**: Nunca subas el archivo `.env` al repositorio
3. **Archivos**: Las imágenes se guardan en `src/uploads/`
4. **Roles**: Solo los administradores pueden gestionar productos, categorías y usuarios
5. **Stock**: El sistema valida stock antes de crear órdenes

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.
