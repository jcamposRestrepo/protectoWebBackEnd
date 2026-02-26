# Servicios de Productos

Este directorio contiene los servicios para manejar operaciones de productos en la aplicación.

## ProductService

El `ProductService` proporciona métodos para manejar operaciones CRUD de productos con validaciones específicas para el formulario de subida de productos.

### Métodos Disponibles

#### `saveProduct(productData, files)`
Guarda un nuevo producto con los datos del formulario.

**Parámetros:**
- `productData` (Object): Datos del producto del formulario
- `files` (Array, opcional): Archivos de imagen subidos

**Campos del productData:**
- `name` (String, requerido): Nombre del producto
- `description` (String, requerido): Descripción del producto
- `price` (Number, requerido): Precio actual del producto
- `originalPrice` (Number, opcional): Precio original del producto
- `categoryId` (Number, requerido): ID de la categoría
- `productType` (String, opcional): Tipo de producto ('componente' o 'computadora')
- `imageUrl` (String, opcional): URL de imagen del producto
- `specifications` (String, opcional): Especificaciones en formato "clave: valor"
- `badge` (String, opcional): Badge del producto
- `inStock` (Boolean, opcional): Estado de stock del producto

**Ejemplo de uso:**
```javascript
const productData = {
  name: "Intel Core i7-13700K",
  description: "Procesador Intel Core i7 de 13va generación",
  price: 450000,
  originalPrice: 520000,
  categoryId: 1,
  productType: "componente",
  imageUrl: "https://ejemplo.com/imagen.jpg",
  specifications: "Frecuencia: 3.4 GHz\nNúcleos: 8\nHilos: 16",
  badge: "Nuevo",
  inStock: true
};

const result = await ProductService.saveProduct(productData, files);
```

#### `updateProduct(productId, productData, files)`
Actualiza un producto existente.

**Parámetros:**
- `productId` (Number): ID del producto a actualizar
- `productData` (Object): Nuevos datos del producto
- `files` (Array, opcional): Archivos de imagen subidos

#### `deleteProduct(productId)`
Elimina un producto (soft delete).

**Parámetros:**
- `productId` (Number): ID del producto a eliminar

### Validaciones

El servicio incluye las siguientes validaciones:

1. **Campos requeridos**: name, price, categoryId, description
2. **Validación de precios**: Deben ser números válidos mayores a 0
3. **Validación de tipo de producto**: Debe ser 'componente' o 'computadora'
4. **Validación de imágenes**: 
   - Archivos: JPG, PNG, GIF, máximo 5MB
   - URLs: Deben ser URLs válidas con extensión de imagen
5. **Validación de categoría**: Debe existir en la base de datos

### Procesamiento de Especificaciones

Las especificaciones se procesan desde texto plano en formato "clave: valor" (una por línea) a un objeto JSON:

**Entrada:**
```
Frecuencia: 3.4 GHz
Núcleos: 8
Hilos: 16
```

**Salida:**
```json
{
  "Frecuencia": "3.4 GHz",
  "Núcleos": "8",
  "Hilos": "16"
}
```

### Manejo de Imágenes

El servicio soporta dos formas de agregar imágenes:

1. **Subida de archivos**: Archivos subidos a través de multer
2. **URL de imagen**: URL directa a una imagen

Las imágenes se almacenan como un array de URLs en el campo `images` del producto.


























