# Guía de URLs para Postman - WebComputo API

## URL Base

```
http://localhost:3001/api/v1
```

**Nota:** El puerto por defecto es `3001` (según `app.js`). Si tienes configurado otro puerto en tu archivo `.env`, úsalo.

## Autenticación

### 1. Registro de Usuario
```
POST http://localhost:3001/api/v1/auth/register
```

**Body (JSON):**
```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@example.com",
  "password": "Password123",
  "phone": "+521234567890",
  "address": "Calle Principal 123"
}
```

### 2. Login con Email/Password
```
POST http://localhost:3001/api/v1/auth/login
```

**Body (JSON):**
```json
{
  "email": "juan@example.com",
  "password": "Password123"
}
```

**Respuesta:** Incluye un `customToken` que se guarda automáticamente en la variable `token` de Postman.

### 2b. Login con Google
```
POST http://localhost:3001/api/v1/auth/login/google
```

**Body (JSON):**
```json
{
  "idToken": "tu_id_token_de_google_aqui"
}
```

**Nota:** Este endpoint requiere un ID token obtenido del cliente después de hacer login con Google usando Firebase SDK. El token se guarda automáticamente en la variable `token` de Postman.

**Para obtener el ID token desde el cliente:**
```javascript
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const provider = new GoogleAuthProvider();
const result = await signInWithPopup(auth, provider);
const idToken = await result.user.getIdToken();
```

### 3. Obtener Perfil (Requiere autenticación)
```
GET http://localhost:3001/api/v1/auth/profile
```

**Headers:**
```
Authorization: Bearer {token}
```

### 4. Actualizar Perfil (Requiere autenticación)
```
PUT http://localhost:3001/api/v1/auth/profile
```

**Headers:**
```
Authorization: Bearer {token}
```

**Body (JSON):**
```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "+521234567890",
  "address": "Nueva dirección 456"
}
```

### 5. Cambiar Contraseña (Requiere autenticación)
```
PUT http://localhost:3001/api/v1/auth/change-password
```

**Headers:**
```
Authorization: Bearer {token}
```

**Body (JSON):**
```json
{
  "currentPassword": "Password123",
  "newPassword": "NewPassword456"
}
```

## Productos

### 1. Obtener Todos los Productos (Público)
```
GET http://localhost:3001/api/v1/products
```

**Query Parameters (opcionales):**
- `page=1` - Número de página
- `limit=10` - Productos por página
- `category={categoryId}` - Filtrar por categoría
- `search=texto` - Buscar productos
- `minPrice=100` - Precio mínimo
- `maxPrice=1000` - Precio máximo
- `brand=Marca` - Filtrar por marca
- `sortBy=createdAt` - Campo para ordenar
- `sortOrder=DESC` - Orden (ASC o DESC)
- `featured=true` - Solo destacados
- `inStock=true` - Solo en stock
- `productType=componente` - Tipo de producto

**Ejemplo:**
```
GET http://localhost:3001/api/v1/products?page=1&limit=10&search=procesador&minPrice=100&maxPrice=5000
```

### 2. Obtener Producto por ID (Público)
```
GET http://localhost:3001/api/v1/products/{id}
```

**Ejemplo:**
```
GET http://localhost:3001/api/v1/products/abc123xyz
```

### 3. Obtener Producto por Slug (Público)
```
GET http://localhost:3001/api/v1/products/slug/{slug}
```

**Ejemplo:**
```
GET http://localhost:3001/api/v1/products/slug/procesador-intel-i7
```

### 4. Obtener Productos Destacados (Público)
```
GET http://localhost:3001/api/v1/products/featured?limit=8
```

### 5. Obtener Productos Relacionados (Público)
```
GET http://localhost:3001/api/v1/products/{id}/related?limit=4
```

### 6. Crear Producto (Solo Admin)
```
POST http://localhost:3001/api/v1/products
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Body (form-data):**
- `name`: Nombre del producto
- `description`: Descripción
- `price`: Precio
- `originalPrice`: Precio original (opcional)
- `categoryId`: ID de categoría
- `productType`: "componente" o "computadora"
- `stock`: Cantidad en stock
- `inStock`: true/false
- `images`: Archivos de imagen (múltiples)
- `specifications`: JSON string con especificaciones

### 7. Actualizar Producto (Solo Admin)
```
PUT http://localhost:3001/api/v1/products/{id}
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

### 8. Eliminar Producto (Solo Admin)
```
DELETE http://localhost:3001/api/v1/products/{id}
```

**Headers:**
```
Authorization: Bearer {token}
```

### 9. Obtener Todos los Productos (Admin - incluye inactivos)
```
GET http://localhost:3001/api/v1/products/admin/all?status=all
```

**Query Parameters:**
- `status`: "active", "inactive" o "all"

**Headers:**
```
Authorization: Bearer {token}
```

### 10. Estadísticas de Productos (Solo Admin)
```
GET http://localhost:3001/api/v1/products/admin/stats
```

**Headers:**
```
Authorization: Bearer {token}
```

## Categorías

### 1. Obtener Todas las Categorías (Público)
```
GET http://localhost:3001/api/v1/categories
```

### 2. Obtener Categoría por ID (Público)
```
GET http://localhost:3001/api/v1/categories/{id}
```

### 3. Crear Categoría (Solo Admin)
```
POST http://localhost:3001/api/v1/categories
```

**Headers:**
```
Authorization: Bearer {token}
```

**Body (JSON):**
```json
{
  "name": "Procesadores",
  "description": "Procesadores Intel y AMD",
  "parentId": null
}
```

## Carrito

### 1. Obtener Carrito del Usuario (Requiere autenticación)
```
GET http://localhost:3001/api/v1/cart
```

**Headers:**
```
Authorization: Bearer {token}
```

### 2. Agregar Producto al Carrito (Requiere autenticación)
```
POST http://localhost:3001/api/v1/cart
```

**Headers:**
```
Authorization: Bearer {token}
```

**Body (JSON):**
```json
{
  "productId": "abc123xyz",
  "quantity": 2
}
```

### 3. Actualizar Cantidad en Carrito (Requiere autenticación)
```
PUT http://localhost:3001/api/v1/cart/{itemId}
```

**Headers:**
```
Authorization: Bearer {token}
```

**Body (JSON):**
```json
{
  "quantity": 3
}
```

### 4. Eliminar Item del Carrito (Requiere autenticación)
```
DELETE http://localhost:3001/api/v1/cart/{itemId}
```

**Headers:**
```
Authorization: Bearer {token}
```

### 5. Limpiar Carrito (Requiere autenticación)
```
DELETE http://localhost:3001/api/v1/cart
```

**Headers:**
```
Authorization: Bearer {token}
```

## Órdenes

### 1. Crear Orden (Requiere autenticación)
```
POST http://localhost:3001/api/v1/orders
```

**Headers:**
```
Authorization: Bearer {token}
```

**Body (JSON):**
```json
{
  "items": [
    {
      "productId": "abc123xyz",
      "quantity": 2,
      "price": 1500.00
    }
  ],
  "shippingAddress": {
    "street": "Calle Principal 123",
    "city": "Ciudad",
    "state": "Estado",
    "zipCode": "12345",
    "country": "México"
  },
  "paymentMethod": "card",
  "subtotal": 3000.00,
  "tax": 480.00,
  "shipping": 100.00,
  "total": 3580.00
}
```

### 2. Obtener Órdenes del Usuario (Requiere autenticación)
```
GET http://localhost:3001/api/v1/orders?page=1&limit=10
```

**Headers:**
```
Authorization: Bearer {token}
```

### 3. Obtener Orden por ID (Requiere autenticación)
```
GET http://localhost:3001/api/v1/orders/{id}
```

**Headers:**
```
Authorization: Bearer {token}
```

## Ruta de Prueba

### Verificar que el servidor está funcionando
```
GET http://localhost:3001/
```

## Configuración en Postman

### 1. Crear una Variable de Entorno
1. Clic en el ícono de "ojo" (👁️) en la esquina superior derecha
2. Clic en "Add" para crear un nuevo entorno
3. Agrega las variables:
   - `base_url`: `http://localhost:3001/api/v1`
   - `token`: (se llenará después del login)

### 2. Usar Variables en las URLs
```
{{base_url}}/products
{{base_url}}/auth/login
```

### 3. Configurar Headers de Autenticación
1. Ve a la pestaña "Authorization"
2. Selecciona "Bearer Token"
3. En el campo Token, escribe: `{{token}}`

O manualmente en Headers:
```
Authorization: Bearer {{token}}
```

### 4. Guardar el Token Automáticamente
En la pestaña "Tests" del request de login, agrega:
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.token) {
        pm.environment.set("token", jsonData.data.token);
    }
}
```

## Ejemplos de Uso

### Flujo Completo: Crear y Consultar Producto

1. **Login como Admin:**
```
POST {{base_url}}/auth/login
Body: {
  "email": "admin@example.com",
  "password": "Admin123"
}
```

2. **Crear Producto:**
```
POST {{base_url}}/products
Headers: Authorization: Bearer {{token}}
Body (form-data):
  - name: "Procesador Intel i7"
  - description: "Procesador de alta gama"
  - price: 3500
  - categoryId: "cat123"
  - productType: "componente"
  - stock: 10
  - inStock: true
```

3. **Consultar Productos:**
```
GET {{base_url}}/products?page=1&limit=10
```

4. **Obtener Producto Específico:**
```
GET {{base_url}}/products/{productId}
```

## Notas Importantes

1. **IDs en Firestore:** Los IDs son strings (no números), por ejemplo: `"abc123xyz456"`

2. **Autenticación:** Todas las rutas marcadas como "Requiere autenticación" necesitan el header `Authorization: Bearer {token}`

3. **Rutas de Admin:** Solo usuarios con `role: "admin"` pueden acceder

4. **Content-Type:** 
   - Para JSON: `application/json`
   - Para form-data (imágenes): `multipart/form-data`

5. **Puerto:** Verifica que el servidor esté corriendo en el puerto correcto:
   ```bash
   npm start
   # o
   npm run dev
   ```

