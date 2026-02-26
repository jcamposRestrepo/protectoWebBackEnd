# Cómo Obtener un categoryId Válido

## Problema
Al crear un producto, necesitas un `categoryId` válido. En Firestore, los IDs son **strings**, no números.

## Solución: Obtener Categorías

### Opción 1: Usar Postman

1. **Haz una petición GET a las categorías:**
   ```
   GET http://localhost:3001/api/v1/categories
   ```

2. **La respuesta será algo como:**
   ```json
   {
     "success": true,
     "data": [
       {
         "id": "abc123xyz",
         "name": "Procesadores",
         "slug": "procesadores",
         "isActive": true
       },
       {
         "id": "def456uvw",
         "name": "Tarjetas Gráficas",
         "slug": "tarjetas-graficas",
         "isActive": true
       }
     ]
   }
   ```

3. **Copia el `id` de la categoría que necesites** (ej: `"abc123xyz"`)

4. **Úsalo en el body del producto:**
   ```json
   {
     "name": "Intel Core i7-13700K",
     "categoryId": "abc123xyz",
     ...
   }
   ```

### Opción 2: Crear una Categoría Primero

Si no tienes categorías, crea una:

```
POST http://localhost:3001/api/v1/categories
Headers:
  Authorization: Bearer {{token}}
Body (JSON):
{
  "name": "Procesadores",
  "description": "Procesadores para computadoras",
  "isActive": true
}
```

La respuesta incluirá el `id` de la categoría creada.

### Opción 3: Desde Firebase Console

1. Ve a: https://console.firebase.google.com/project/computedemo-9869e/firestore
2. Abre la colección `categories`
3. Copia el **Document ID** de la categoría que necesites

## Ejemplo Completo

1. **Obtener categorías:**
   ```
   GET /api/v1/categories
   ```

2. **Respuesta:**
   ```json
   {
     "success": true,
     "data": [
       {
         "id": "cat_procesadores_001",
         "name": "Procesadores"
       }
     ]
   }
   ```

3. **Crear producto con el categoryId:**
   ```json
   {
     "name": "Intel Core i7-13700K",
     "categoryId": "cat_procesadores_001",
     "price": 450000,
     "productType": "componente"
   }
   ```

## ⚠️ IMPORTANTE: ID vs Nombre

**DEBES enviar el ID (string), NO el nombre de la categoría**

### ❌ INCORRECTO (usando el nombre):
```json
{
  "name": "Intel Core i7-13700K",
  "categoryId": "Procesadores",  // ❌ Esto NO funciona
  ...
}
```

### ✅ CORRECTO (usando el ID):
```json
{
  "name": "Intel Core i7-13700K",
  "categoryId": "abc123xyz",  // ✅ Esto SÍ funciona
  ...
}
```

## Nota Importante

- Los IDs en Firestore son **strings**, no números
- El `categoryId` es **requerido** y no puede estar vacío
- **DEBES usar el ID**, no el nombre de la categoría
- Asegúrate de que la categoría exista y esté activa (`isActive: true`)
- Si envías un ID inválido, recibirás un error claro indicando que la categoría no existe


