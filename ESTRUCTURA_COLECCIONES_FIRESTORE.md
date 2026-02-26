# Estructura de Colecciones en Firestore

Las colecciones en Firestore se crean **automáticamente** cuando insertas el primer documento. No necesitas crearlas manualmente.

## Colección: `users`

Esta colección almacena los usuarios del sistema.

### Estructura de un documento:

```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@example.com",
  "password": "$2a$10$...", // Hash bcrypt (nunca se expone)
  "phone": "+521234567890",
  "address": "Calle Principal 123",
  "role": "client", // "admin" o "client"
  "isActive": true,
  "emailVerified": false,
  "avatar": "url_del_avatar",
  "createdAt": "2025-11-25T16:00:00.000Z",
  "updatedAt": "2025-11-25T16:00:00.000Z"
}
```

### Campos:

- **firstName** (string, requerido): Nombre del usuario
- **lastName** (string, requerido): Apellido del usuario
- **email** (string, requerido, único): Email del usuario
- **password** (string, requerido): Contraseña hasheada con bcrypt
- **phone** (string, opcional): Teléfono del usuario
- **address** (string, opcional): Dirección del usuario
- **role** (string, requerido): Rol del usuario ("admin" o "client")
- **isActive** (boolean, requerido): Si el usuario está activo
- **emailVerified** (boolean, requerido): Si el email está verificado
- **avatar** (string, opcional): URL del avatar
- **createdAt** (timestamp, automático): Fecha de creación
- **updatedAt** (timestamp, automático): Fecha de actualización

### Índices necesarios:

Para búsquedas por email (ya está optimizado):
- Campo: `email` (no requiere índice compuesto para búsquedas simples)

## Colección: `products`

Almacena los productos del catálogo.

### Estructura básica:

```json
{
  "name": "Procesador Intel i7",
  "description": "Descripción del producto",
  "price": 3500.00,
  "comparePrice": 4000.00,
  "sku": "PROC-I7-123456",
  "stock": 10,
  "minStock": 5,
  "categoryId": "cat123",
  "isActive": true,
  "isFeatured": false,
  "inStock": true,
  "productType": "componente",
  "images": ["/uploads/products/image1.jpg"],
  "specifications": {},
  "tags": [],
  "slug": "procesador-intel-i7",
  "createdAt": "2025-11-25T16:00:00.000Z",
  "updatedAt": "2025-11-25T16:00:00.000Z"
}
```

## Colección: `categories`

Almacena las categorías de productos.

## Colección: `orders`

Almacena las órdenes de compra.

## Colección: `orderItems`

Almacena los items de cada orden.

## Colección: `cart`

Almacena los items del carrito de compras.

## ¿Cómo se crean las colecciones?

**No necesitas crearlas manualmente.** Se crean automáticamente cuando:

1. Insertas el primer documento en la colección
2. Ejecutas una consulta que referencia la colección

### Ejemplo:

Cuando un usuario se registra por primera vez:
```javascript
// Esto crea automáticamente la colección "users" si no existe
await UserService.create({
  firstName: "Juan",
  lastName: "Pérez",
  email: "juan@example.com",
  password: "hashed_password",
  role: "client"
});
```

## Verificar colecciones en Firebase Console

Puedes ver todas tus colecciones en:
https://console.firebase.google.com/project/computedemo-9869e/firestore/data

## Nota sobre Firebase Authentication

Actualmente estamos usando:
- ✅ **Firestore** para almacenar datos de usuarios
- ✅ **bcrypt** para hashear contraseñas
- ✅ **JWT** para tokens de sesión

**Alternativa futura:** Podrías usar **Firebase Authentication** que:
- Maneja autenticación automáticamente
- No requiere almacenar contraseñas
- Ofrece verificación de email, recuperación de contraseña, etc.
- Pero aún necesitarías Firestore para datos adicionales del perfil

La implementación actual funciona perfectamente y te da más control.

