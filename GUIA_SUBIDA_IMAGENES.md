# 📸 Guía de Subida de Imágenes para Productos

## Cómo subir imágenes al crear o actualizar un producto

### Opciones para agregar imágenes

Puedes agregar imágenes de **múltiples formas** y **combinarlas**:

#### 1. **Subir archivos directamente** (Recomendado)

**Campos aceptados**: `productImages` o `images` (ambos funcionan)

**Formatos permitidos**:
- JPEG / JPG
- PNG
- GIF
- WEBP

**Límites**:
- Máximo **10 archivos** por solicitud
- Máximo **5MB por archivo**
- Cada archivo debe ser una imagen válida

**Ejemplo en Postman (form-data)**:
```
Key: productImages
Type: File
Value: [Seleccionar archivo]
```

**Ejemplo en JavaScript (FormData)**:
```javascript
const formData = new FormData();
formData.append('name', 'Intel Core i7-13700K');
formData.append('price', '450000');
formData.append('categoryId', '1');
formData.append('productType', 'componente');
formData.append('productImages', fileInput.files[0]); // ✅ Campo correcto
// Puedes agregar más imágenes:
formData.append('productImages', fileInput.files[1]);
formData.append('productImages', fileInput.files[2]);
```

**Ejemplo con múltiples imágenes en React**:
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData();
  
  // Agregar datos del formulario
  formData.append('name', productData.name);
  formData.append('price', productData.price);
  formData.append('categoryId', productData.categoryId);
  formData.append('productType', productData.productType);
  
  // Agregar múltiples imágenes
  productData.imageFiles.forEach((file) => {
    formData.append('productImages', file); // ✅ Campo correcto
  });
  
  // Enviar
  await fetch('http://localhost:3001/api/v1/products', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
};
```

#### 2. **Usar URL de imagen** (una sola URL)

**Campo**: `imageUrl`

Si prefieres usar una imagen que ya está alojada en internet:

```javascript
// En JSON (raw body)
{
  "name": "Intel Core i7-13700K",
  "price": 450000,
  "categoryId": "abc123",
  "productType": "componente",
  "imageUrl": "https://example.com/imagen-producto.jpg"
}
```

#### 3. **Usar múltiples URLs** (array de URLs)

**Campo**: `imageUrls` (array)

Puedes enviar múltiples URLs en un array:

```javascript
// En JSON (raw body)
{
  "name": "Intel Core i7-13700K",
  "price": 450000,
  "categoryId": "abc123",
  "productType": "componente",
  "imageUrls": [
    "https://example.com/imagen1.jpg",
    "https://example.com/imagen2.jpg",
    "https://example.com/imagen3.jpg"
  ]
}
```

#### 4. **Array directo de imágenes**

**Campo**: `images` (array)

Puedes enviar un array directo de URLs (igual que `imageUrls`):

```javascript
// En JSON (raw body)
{
  "name": "Intel Core i7-13700K",
  "price": 450000,
  "categoryId": "abc123",
  "productType": "componente",
  "images": [
    "https://example.com/imagen1.jpg",
    "https://example.com/imagen2.jpg"
  ]
}
```

### 🔄 Combinar múltiples formas

**¡Puedes combinar todas las formas!** Por ejemplo:

```javascript
// En form-data (Postman o código)
const formData = new FormData();
formData.append('name', 'Intel Core i7-13700K');
formData.append('price', '450000');
formData.append('categoryId', 'abc123');
formData.append('productType', 'componente');

// 1. Subir archivos
formData.append('productImages', archivo1);
formData.append('productImages', archivo2);

// 2. Agregar URL única
formData.append('imageUrl', 'https://example.com/imagen-externa.jpg');

// 3. Agregar múltiples URLs (como JSON string)
formData.append('imageUrls', JSON.stringify([
  'https://example.com/imagen3.jpg',
  'https://example.com/imagen4.jpg'
]));
```

O en JSON (raw body):

```json
{
  "name": "Intel Core i7-13700K",
  "price": 450000,
  "categoryId": "abc123",
  "productType": "componente",
  "imageUrl": "https://example.com/imagen1.jpg",
  "imageUrls": [
    "https://example.com/imagen2.jpg",
    "https://example.com/imagen3.jpg"
  ],
  "images": [
    "https://example.com/imagen4.jpg"
  ]
}
```

**Nota**: Todas las imágenes se combinarán en un solo array.

### ⚠️ IMPORTANTE - Nombres de campos

**Para archivos subidos:**
- ✅ `productImages` (recomendado)
- ✅ `images` (también funciona)

**Para URLs:**
- ✅ `imageUrl` (una sola URL)
- ✅ `imageUrls` (array de URLs)
- ✅ `images` (array de URLs - mismo que `imageUrls`)

**Nota**: Si usas `images` con archivos, se procesarán como archivos. Si lo usas en JSON, se procesará como URLs.

### 📁 Cómo se guardan las imágenes

1. **Ubicación física**: 
   - Las imágenes se guardan en: `src/uploads/products/`
   - Ejemplo: `ArabImageImage-1704123456789-123456789.jpg`

2. **URL de acceso**:
   - Las imágenes son accesibles en: `http://localhost:3001/uploads/products/[nombre-archivo]`
   - Ejemplo: `http://localhost:3001/uploads/products/productImages-1704123456789-123456789.jpg`

3. **En la base de datos**:
   - Se guarda como array JSON con las rutas: `["/uploads/products/archivo1.jpg", "/uploads/products/archivo2.jpg"]`

### Ejemplo completo de body (POST /products)

#### Opción A: En Postman (form-data) - Archivos + URLs
```
name: Intel Core i7-13700K
description: Procesador Intel Core i7...
price: 450000
originalPrice: 520000
categoryId: abc123
productType: componente
stock: 10
inStock: true
badge: Nuevo
specifications: {"Frecuencia": "3.4 GHz", "Núcleos": "8"}
productImages: [Archivo 1] (File)
productImages: [Archivo 2] (File)
imageUrl: https://example.com/imagen-externa.jpg
imageUrls: ["https://example.com/img1.jpg", "https://example.com/img2.jpg"]
```

#### Opción B: En Postman (raw JSON) - Solo URLs
```json
{
  "name": "Intel Core i7-13700K",
  "description": "Procesador Intel Core i7...",
  "price": 450000,
  "comparePrice": 520000,
  "categoryId": "abc123",
  "productType": "componente",
  "stock": 10,
  "inStock": true,
  "badge": "Nuevo",
  "specifications": {
    "Frecuencia": "3.4 GHz",
    "Núcleos": "8"
  },
  "imageUrl": "https://example.com/imagen1.jpg",
  "imageUrls": [
    "https://example.com/imagen2.jpg",
    "https://example.com/imagen3.jpg"
  ],
  "images": [
    "https://example.com/imagen4.jpg"
  ]
}
```

#### En código JavaScript:
```javascript
const formData = new FormData();

// Datos del producto
formData.append('name', 'Intel Core i7-13700K');
formData.append('description', 'Procesador Intel...');
formData.append('price', '450000');
formData.append('originalPrice', '520000');
formData.append('categoryId', '1');
formData.append('productType', 'componente');
formData.append('stock', '10');
formData.append('inStock', 'true');
formData.append('badge', 'Nuevo');
formData.append('specifications', JSON.stringify({
  "Frecuencia": "3.4 GHz",
  "Núcleos": "8"
}));

// Imágenes - Puedes agregar múltiples archivos
if (selectedFiles && selectedFiles.length > 0) {
  Array.from(selectedFiles).forEach(file => {
    formData.append('productImages', file); // ✅ Campo correcto
  });
}

// Y también agregar URLs (combinar ambas formas)
formData.append('imageUrl', 'https://example.com/imagen-externa.jpg');
formData.append('imageUrls', JSON.stringify([
  'https://example.com/imagen2.jpg',
  'https://example.com/imagen3.jpg'
]));

// Enviar petición
fetch('http://localhost:3001/api/v1/products', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
    // NO agregar 'Content-Type' - el navegador lo hace automáticamente para FormData
  },
  body: formData
});
```

### Actualizar producto con nuevas imágenes

**Comportamiento al actualizar:**

1. **Si envías `images` (array)**: Reemplaza TODAS las imágenes existentes
2. **Si envías archivos, `imageUrl` o `imageUrls`**: Se AGREGAN a las existentes

```javascript
// Opción 1: Agregar nuevas imágenes a las existentes
const formData = new FormData();
formData.append('price', '440000');
formData.append('productImages', nuevaImagen1); // Se agregan
formData.append('imageUrl', 'https://example.com/nueva.jpg'); // Se agrega

// Opción 2: Reemplazar todas las imágenes
const jsonData = {
  price: 440000,
  images: [ // Este array reemplaza todas las imágenes
    'https://example.com/imagen1.jpg',
    'https://example.com/imagen2.jpg'
  ]
};

fetch(`http://localhost:3001/api/v1/products/${productId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(jsonData)
});
```

### Errores comunes

1. **"Campo de archivo inesperado"**
   - ❌ Usaste un nombre de campo incorrecto para archivos
   - ✅ Usa `productImages` o `images` para archivos

2. **"El archivo es demasiado grande"**
   - ❌ Archivo > 5MB
   - ✅ Comprime la imagen o usa una más pequeña

3. **"Solo se permiten archivos de imagen"**
   - ❌ Formato no soportado
   - ✅ Usa JPEG, PNG, GIF o WEBP

4. **"Demasiados archivos"**
   - ❌ Más de 10 archivos
   - ✅ Máximo 10 imágenes por solicitud

### Resumen rápido

| Aspecto | Detalle |
|---------|---------|
| **Campos para archivos** | `productImages` o `images` |
| **Campo para URL única** | `imageUrl` |
| **Campo para múltiples URLs** | `imageUrls` o `images` (array) |
| **¿Se pueden combinar?** | ✅ Sí, todas las formas se combinan |
| **Máximo archivos** | 10 |
| **Tamaño máximo** | 5MB por archivo |
| **Formatos** | JPEG, JPG, PNG, GIF, WEBP |
| **Ubicación guardado** | `src/uploads/products/` |
| **URL acceso** | `http://localhost:3001/uploads/products/[archivo]` |
| **Al actualizar** | `images` reemplaza, otros campos agregan |



























