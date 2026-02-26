# 📊 Tablas de la Base de Datos WebComputo

Tu base de datos SQLite tiene las siguientes **tablas**:

---

## 📋 Lista de Tablas

### 1. **users** - Usuarios del Sistema
Almacena la información de todos los usuarios (administradores y clientes).

**Columnas:**
- `id` - ID único (autoincremental)
- `firstName` - Nombre
- `lastName` - Apellido
- `email` - Correo electrónico (único)
- `password` - Contraseña encriptada
- `phone` - Teléfono
- `address` - Dirección
- `role` - Rol (admin o client)
- `isActive` - Estado activo/inactivo
- `emailVerified` - Email verificado
- `avatar` - Foto de perfil
- `createdAt` - Fecha de creación
- `updatedAt` - Fecha de actualización

**Datos de ejemplo:**
- Email: `admin@webcomputo.com`
- Password: `admin123`
- Rol: `admin`

---

### 2. **categories** - Categorías de Productos
Almacena las categorías de productos.

**Columnas:**
- `id` - ID único (autoincremental)
- `name` - Nombre de la categoría
- `description` - Descripción
- `image` - Imagen de la categoría
- `isActive` - Estado activo/inactivo
- `parentId` - ID de la categoría padre (para subcategorías)
- `slug` - URL amigable (único)
- `createdAt` - Fecha de creación
- `updatedAt` - Fecha de actualización

**Categorías existentes:**
1. Procesadores
2. Tarjetas Gráficas
3. Memoria RAM
4. Almacenamiento
5. Placas Base
6. Fuentes de Poder
7. Gabinetes
8. Refrigeración

---

### 3. **products** - Productos
Almacena todos los productos del catálogo.

**Columnas:**
- `id` - ID único (autoincremental)
- `name` - Nombre del producto
- `description` - Descripción completa
- `shortDescription` - Descripción corta
- `price` - Precio
- `comparePrice` - Precio de comparación (antes/precio tachado)
- `sku` - Código SKU (único)
- `stock` - Stock disponible
- `minStock` - Stock mínimo
- `weight` - Peso
- `dimensions` - Dimensiones
- `brand` - Marca
- `model` - Modelo
- `warranty` - Garantía
- `images` - Array de URLs de imágenes (JSON)
- `specifications` - Especificaciones técnicas (JSON)
- `isActive` - Estado activo/inactivo
- `isFeatured` - Producto destacado
- `slug` - URL amigable (único)
- `categoryId` - ID de la categoría (FK)
- `tags` - Array de etiquetas (JSON)
- `createdAt` - Fecha de creación
- `updatedAt` - Fecha de actualización

**Productos existentes:**
1. Intel Core i5-12400F - $2,999.00
2. AMD Ryzen 5 Ek-X - $2,799.00
3. NVIDIA GeForce RTX 4060 - $8,999.00
4. Corsair Vengeance LPX 16GB DDR4 - $1,299.00
5. Samsung 970 EVO Plus 1TB NVMe SSD - $2,499.00

---

### 4. **orders** - Órdenes de Compra
Almacena las órdenes realizadas por los clientes.

**Columnas:**
- `id` - ID único (autoincremental)
- `orderNumber` - Número de orden (único)
- `status` - Estado (pending, processing, shipped, delivered, cancelled, refunded)
- `subtotal` - Subtotal
- `tax` - Impuestos
- `shipping` - Costo de envío
- `total` - Total a pagar
- `paymentMethod` - Método de pago (cash, card, transfer, paypal)
- `paymentStatus` - Estado del pago (pending, paid, failed, refunded)
- `shippingAddress` - Dirección de envío (JSON)
- `billingAddress` - Dirección de facturación (JSON)
- `notes` - Notas
- `trackingNumber` - Número de seguimiento
- `shippedAt` - Fecha de envío
- `deliveredAt` - Fecha de entrega
- `userId` - ID del usuario (FK)
- `createdAt` - Fecha de creación
- `updatedAt` - Fecha de actualización

---

### 5. **order_items** - Items de Cada Orden
Almacena los productos que forman parte de cada orden.

**Columnas:**
- `id` - ID único (autoincremental)
- `quantity` - Cantidad
- `price` - Precio unitario al momento de la compra
- `total` - Total (quantity × price)
- `productSnapshot` - Captura del producto al momento de la compra (JSON)
- `orderId` - ID de la orden (FK)
- `productId` - ID del producto (FK)
- `createdAt` - Fecha de creación
- `updatedAt` - Fecha de actualización

黑色的

### 6. **cart** - Carrito de Compras
Almacena los productos agregados al carrito por cada usuario.

**Columnas:**
- `id` - ID único (autoincremental)
- `quantity` - Cantidad
- `userId` - ID del usuario (FK)
- `productId` - ID del producto (FK)
- `createdAt` - Fecha de creación
- `updatedAt` - Fecha de actualización

**Nota:** Hay un índice único en (userId, productId) para evitar duplicados.

---

### 7. **SequelizeMeta** - Control de Migraciones
Tabla interna de Sequelize para controlar qué migraciones se han ejecutado.

**Columnas:**
- `name` - Nombre del archivo de migración

---

## 🔍 Cómo Ver las Tablas

### Opción 1: Usando la API REST

El servidor está corriendo en: **http://localhost:3000**

Puedes usar las siguientes URLs:

```bash
# Ver categorías
GET http://localhost:3000/api/v1/categories

# Ver productos
GET http://localhost:3000/api/v1/products

# Ver producto específico
GET http://localhost:3000/api/v1/products/1

# Ver categoría específica
GET http://localhost:3000/api/v1/categories/1

# Ver productos destacados
GET http://localhost:3000/api/v1/products/featured
```

### Opción 2: Usando herramientas

Si quieres una interfaz visual:

1. **SQLite Browser**: https://sqlitebrowser.org/
   - Descarga e instala
   - Abre `database.sqlite`
   - Verás todas las tablas de forma gráfica

2. **VS Code Extension**: 
   - Instala "SQLite Viewer" en VS Code
   - Abre `database.sqlite` en VS Code

3. **Heroku Dataclip** (en línea):
   - Sube el archivo SQLite
   - Visualiza las tablas

### Opción 3: Usando línea de comandos

```bash
# Ver todas las tablas (requiere sqlite3 instalado)
sqlite3 database.sqlite ".tables"

# Ver estructura de una tabla
sqlite3 database.sqlite ".schema users"

# Ver datos de una tabla
sqlite3 database.sqlite "SELECT * FROM users;"
```

---

## 📊 Estructura Visual

```
webcomputo_db (SQLite)
│
├── users (Usuarios)
│   └── id, email, password, role
│
├── categories (Categorías)
│   └── id, name, slug, parentId
│
├── products (Productos)
│   └── id, name, price, categoryId → FK
│
├── orders (Órdenes)
│   └── id, orderNumber, userId → FK
│
├── order_items (Items de Orden)
│   └── id, orderId → FK, productId → FK
│
└── cart (Carrito)
    └── id, userId → FK, productId → FK
```

---

## 🚀 Próximos Pasos

1. **Explorar los datos**: Usa la API para ver los productos y categorías
2. **Crear tu cuenta**: Regístrate como cliente en la API
3. **Agregar productos al carrito**: Prueba la funcionalidad del carrito
4. **Ver las órdenes**: Crea una orden de prueba

---

## 💡 Datos de Prueba

### Usuario Administrador:
- Email: `admin@webcomputo.com`
- Password: `admin123`

### Usuario Cliente:
Puedes crear uno registrándote en:
```
POST http://localhost:3000/api/v1/auth/register
```

---

✅ **Todo está listo para empezar a desarrollar!**
































