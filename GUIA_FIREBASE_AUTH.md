# Guía de Firebase Authentication

## Cambio Implementado

Se ha migrado la autenticación a **Firebase Authentication**, que es más seguro y robusto que la autenticación personalizada.

## Cómo Funciona

### 1. Registro de Usuario

**Endpoint:** `POST /api/v1/auth/register`

**Body:**
```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@test.com",
  "password": "Password123",
  "phone": "+521234567890",
  "address": "Calle Principal 123"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "customToken": "eyJhbGciOiJSUzI1NiIs...",
    "firebaseUid": "abc123xyz"
  }
}
```

### 2. Login de Usuario

**Endpoint:** `POST /api/v1/auth/login`

**Body:**
```json
{
  "email": "juan@test.com",
  "password": "Password123"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "customToken": "eyJhbGciOiJSUzI1NiIs...",
    "firebaseUid": "abc123xyz"
  }
}
```

### 3. Usar el Token en Requests

El `customToken` que recibes debe intercambiarse por un **ID token** en el cliente usando el SDK de Firebase.

**Para Postman (temporal):**

Puedes usar el `customToken` directamente, pero es mejor usar el ID token. Para obtener el ID token:

1. Usa el `customToken` en el cliente (frontend) con Firebase SDK
2. Intercámbialo por un ID token
3. Usa ese ID token en el header `Authorization: Bearer {idToken}`

**O usa el endpoint de verificación:**

**Endpoint:** `POST /api/v1/auth/verify-token`

**Body:**
```json
{
  "idToken": "tu_id_token_de_firebase"
}
```

## Flujo Recomendado

### Opción 1: Desde el Cliente (Frontend)

1. El cliente usa Firebase SDK para hacer login
2. Obtiene un ID token
3. Envía ese ID token en el header `Authorization: Bearer {idToken}`
4. El backend verifica el token con Firebase Admin SDK

### Opción 2: Desde Postman (Backend)

1. Haz `POST /api/v1/auth/login` con email y password
2. Recibes un `customToken`
3. Usa ese `customToken` en el header `Authorization: Bearer {customToken}`
4. El backend lo verifica

**NOTA:** El `customToken` funciona, pero en producción es mejor usar ID tokens del cliente.

## Ventajas de Firebase Auth

✅ **Seguridad mejorada** - Firebase maneja las contraseñas de forma segura
✅ **Verificación de email** - Integrado
✅ **Recuperación de contraseña** - Automático
✅ **Múltiples proveedores** - Google, Facebook, etc.
✅ **Tokens seguros** - Generados por Firebase
✅ **No almacenas contraseñas** - Firebase las maneja

## Estructura de Datos

### Firebase Authentication
- Almacena: email, password (hasheada), UID, emailVerified
- No almacena: firstName, lastName, phone, address, role

### Firestore (colección `users`)
- Almacena: firstName, lastName, phone, address, role, etc.
- ID del documento = UID de Firebase Auth

## Endpoints Actualizados

- `POST /api/v1/auth/register` - Crea usuario en Firebase Auth + Firestore
- `POST /api/v1/auth/login` - Genera customToken
- `POST /api/v1/auth/verify-token` - Verifica ID token de Firebase
- `GET /api/v1/auth/profile` - Obtiene perfil (requiere token)
- `PUT /api/v1/auth/profile` - Actualiza perfil (requiere token)
- `PUT /api/v1/auth/change-password` - Cambia contraseña (requiere token)

## Configuración en Firebase Console

1. Ve a: https://console.firebase.google.com/project/computedemo-9869e/authentication
2. Habilita **Email/Password** como método de autenticación
3. (Opcional) Habilita **Google** u otros proveedores

## Prueba en Postman

1. **Registrar usuario:**
   ```
   POST http://localhost:3001/api/v1/auth/register
   Body: {
     "firstName": "Juan",
     "lastName": "Pérez",
     "email": "juan@test.com",
     "password": "Password123"
   }
   ```

2. **Copiar el customToken** de la respuesta

3. **Usar en otros endpoints:**
   ```
   Authorization: Bearer {customToken}
   ```

## Notas Importantes

- Los IDs de usuario ahora son los UIDs de Firebase Auth (strings)
- Las contraseñas se manejan en Firebase Auth, no en Firestore
- El `customToken` puede usarse directamente, pero el ID token es preferible
- Para producción, el cliente debe usar Firebase SDK para obtener ID tokens

