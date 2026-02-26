# Solución: Error "Token de acceso requerido" en Postman

## Problema
Al intentar crear un producto, recibes el error: `"Token de acceso requerido"`

## Soluciones

### 1. Verificar que el Token se Guardó Correctamente

Después de hacer **Login** o **Register**, verifica que el token se guardó:

1. En Postman, ve a la pestaña **"Tests"** del request de Login
2. Deberías ver un script que guarda el token automáticamente
3. Verifica la variable `{{token}}` en el entorno

### 2. Verificar el Header Authorization

En el request de **Create Product**, verifica que el header esté configurado así:

**En la pestaña "Headers":**
- **Key:** `Authorization`
- **Value:** `Bearer {{token}}`

**O en la pestaña "Authorization":**
- **Type:** Bearer Token
- **Token:** `{{token}}`

### 3. Verificar que el Entorno Esté Activo

1. En Postman, verifica que el entorno **"WebComputo Local - Firebase"** esté seleccionado
2. Deberías ver el entorno activo en la esquina superior derecha

### 4. Verificar el Formato del Token

El token debe enviarse en el formato:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**NO debe ser:**
- `Authorization: {{token}}` ❌
- `Authorization: token` ❌

**DEBE ser:**
- `Authorization: Bearer {{token}}` ✅

### 5. Pasos para Probar

1. **Primero, haz Login:**
   ```
   POST http://localhost:3001/api/v1/auth/login
   Body: {
     "email": "tu_email@test.com",
     "password": "tu_password"
   }
   ```

2. **Verifica que el token se guardó:**
   - Ve a la pestaña "Environment" en Postman
   - Busca la variable `token`
   - Debería tener un valor como: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. **Luego, crea el producto:**
   ```
   POST http://localhost:3001/api/v1/products
   Headers:
     Authorization: Bearer {{token}}
   ```

### 6. Si el Token No se Guarda Automáticamente

Puedes guardarlo manualmente:

1. Después del Login, copia el token de la respuesta
2. Ve a la variable `token` en el entorno
3. Pega el token manualmente

### 7. Verificar que el Usuario Sea Admin

Para crear productos, el usuario debe tener `role: "admin"`. 

Si tu usuario es `client`, necesitas:
- Crear un usuario admin manualmente en Firestore, o
- Actualizar el role del usuario a "admin" en Firestore

### 8. Debug: Ver qué Recibe el Servidor

Si aún no funciona, puedes agregar un console.log temporal en el middleware para ver qué recibe:

```javascript
console.log('Auth Header:', req.headers.authorization);
console.log('Token:', token);
```

## Checklist

- [ ] El entorno "WebComputo Local - Firebase" está activo
- [ ] Hiciste Login y el token se guardó en `{{token}}`
- [ ] El header Authorization tiene el formato: `Bearer {{token}}`
- [ ] El usuario tiene role: "admin"
- [ ] El servidor está corriendo en el puerto 3001

## Ejemplo de Request Correcto en Postman

**URL:** `POST http://localhost:3001/api/v1/products`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFiYzEyMyIsImVtYWlsIjoianVhbkB0ZXN0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTYzNzg5MDAwMCwiZXhwIjoxNjM3OTc2NDAwfQ.xyz123...
Content-Type: multipart/form-data
```

**Body (form-data):**
- name: "Producto de prueba"
- description: "Descripción del producto"
- price: "1000"
- categoryId: "id_de_categoria"
- productType: "componente"

