# Endpoints de Productos

Este documento describe todos los endpoints disponibles para visualizar y gestionar productos.

## Endpoints Públicos

### 1. Obtener todos los productos (con filtros)
**GET** `/api/products`

Obtiene una lista paginada de productos activos con filtros opcionales.

**Parámetros de consulta:**
- `page` (number, opcional): Número de página (default: 1)
- `limit` (number, opcional): Productos por página (default: 10)
- `category` (number, opcional): ID de categoría para filtrar
- `search` (string, opcional): Búsqueda por nombre, descripción, marca o modelo
- `minPrice` (number, opcional): Precio mínimo
- `maxPrice` (number, opcional): Precio máximo
- `brand` (string, opcional): Filtrar por marca
- `sortBy` (string, opcional): Campo para ordenar (default: 'createdAt')
- `sortOrder` (string, opcional): Orden 'ASC' o 'DESC' (default: 'DESC')
- `featured` (boolean, opcional): Filtrar productos destacados
- `inStock` (boolean, opcional): Filtrar productos en stock
- `productType` (string, opcional): Tipo de producto ('componente' o 'computadora')

**Ejemplo de uso:**
```
GET /api/products?page=1&limit=20&category=1&search=intel&minPrice=100000&maxPrice=500000&productType=componente&inStock=true
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Intel Core i7-13700K",
        "description": "Procesador Intel Core i7 de 13va generación",
        "price": 450000,
        "comparePrice": 520000,
        "productType": "componente",
        "inStock": true,
        "images": ["/uploads/products/cpu1.jpg"],
        "specifications": {
          "Frecuencia": "3.4 GHz",
          "Núcleos": "8",
          "Hilos": "16"
        },
        "category": {
          "id": 1,
          "name": "Procesadores",
          "slug": "procesadores"
        },
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 2. Obtener producto por ID
**GET** `/api/products/:id`

Obtiene un producto específico por su ID.

**Parámetros:**
- `id` (number, requerido): ID del producto

### 3. Obtener producto por slug
**GET** `/api/products/slug/:slug`

Obtiene un producto específico por su slug.

**Parámetros:**
- `slug` (string, requerido): Slug del producto

### 4. Obtener productos destacados
**GET** `/api/products/featured`

Obtiene una lista de productos destacados.

**Parámetros de consulta:**
- `limit` (number, opcional): Número máximo de productos (default: 8)

### 5. Obtener productos relacionados
**GET** `/api/products/:id/related`

Obtiene productos relacionados basados en la categoría del producto.

**Parámetros:**
- `id` (number, requerido): ID del producto

**Parámetros de consulta:**
- `limit` (number, opcional): Número máximo de productos (default: 4)

## Endpoints de Administrador

### 6. Obtener todos los productos (admin)
**GET** `/api/products/admin/all`

Obtiene una lista paginada de todos los productos (incluyendo inactivos) para administradores.

**Headers requeridos:**
- `Authorization: Bearer <token>`

**Parámetros de consulta:**
- Todos los parámetros del endpoint público
- `status` (string, opcional): Estado del producto ('active', 'inactive', 'all')

**Ejemplo de uso:**
```
GET /api/products/admin/all?status=active&productType=componente&page=1&limit=20
```

### 7. Obtener estadísticas de productos
**GET** `/api/products/admin/stats`

Obtiene estadísticas detalladas de los productos para el panel de administración.

**Headers requeridos:**
- `Authorization: Bearer <token>`

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalProducts": 150,
      "activeProducts": 140,
      "inactiveProducts": 10,
      "featuredProducts": 25,
      "inStockProducts": 120,
      "outOfStockProducts": 20
    },
    "byType": {
      "componentProducts": 100,
      "computerProducts": 40
    },
    "byCategory": [
      {
        "categoryId": 1,
        "categoryName": "Procesadores",
        "count": 30
      },
      {
        "categoryId": 2,
        "categoryName": "Tarjetas Gráficas",
        "count": 25
      }
    ],
    "pricing": {
      "averagePrice": "250000.00",
      "minPrice": "50000.00",
      "maxPrice": "1000000.00"
    }
  }
}
```

## Endpoints de Gestión (Admin)

### 8. Crear producto
**POST** `/api/products`

Crea un nuevo producto.

**Headers requeridos:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data` (para subir imágenes)

**Body (form-data):**
- `name` (string, requerido): Nombre del producto
- `description` (string, requerido): Descripción del producto
- `price` (number, requerido): Precio actual
- `originalPrice` (number, opcional): Precio original
- `categoryId` (number, requerido): ID de la categoría
- `productType` (string, opcional): Tipo de producto ('componente' o 'computadora')
- `imageUrl` (string, opcional): URL de imagen
- `specifications` (string, opcional): Especificaciones en formato "clave: valor"
- `badge` (string, opcional): Badge del producto
- `inStock` (boolean, opcional): Estado de stock
- `images` (file[], opcional): Archivos de imagen (JPG, PNG, GIF, máx 5MB)

### 9. Actualizar producto
**PUT** `/api/products/:id`

Actualiza un producto existente.

**Headers requeridos:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data` (para subir imágenes)

**Parámetros:**
- `id` (number, requerido): ID del producto

**Body:** Mismos campos que crear producto (todos opcionales)

### 10. Eliminar producto
**DELETE** `/api/products/:id`

Elimina un producto (soft delete).

**Headers requeridos:**
- `Authorization: Bearer <token>`

**Parámetros:**
- `id` (number, requerido): ID del producto

## Códigos de Estado HTTP

- `200 OK`: Operación exitosa
- `201 Created`: Producto creado exitosamente
- `400 Bad Request`: Datos inválidos o errores de validación
- `401 Unauthorized`: Token de autenticación requerido
- `403 Forbidden`: Permisos de administrador requeridos
- `404 Not Found`: Producto no encontrado
- `500 Internal Server Error`: Error interno del servidor

## Filtros y Búsqueda

### Búsqueda de texto
La búsqueda se realiza en los siguientes campos:
- Nombre del producto
- Descripción
- Marca
- Modelo

### Ordenamiento
Campos disponibles para ordenar:
- `createdAt`: Fecha de creación
- `updatedAt`: Fecha de actualización
- `name`: Nombre del producto
- `price`: Precio
- `isFeatured`: Productos destacados

### Filtros por tipo de producto
- `componente`: Componentes individuales
- `computadora`: Computadoras completas

### Filtros por estado (solo admin)
- `active`: Solo productos activos
- `inactive`: Solo productos inactivos
- `all`: Todos los productos (activos e inactivos)
