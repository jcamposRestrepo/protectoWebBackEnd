# Autenticación con Google y Email/Password

## Configuración en Firebase Console

### 1. Habilitar Email/Password
1. Ve a: https://console.firebase.google.com/project/computedemo-9869e/authentication
2. Pestaña "Sign-in method"
3. Habilita "Email/Password"
4. Guarda

### 2. Habilitar Google Sign-In
1. En la misma página "Sign-in method"
2. Haz clic en "Google"
3. Habilita el toggle
4. Configura el "Project support email" (tu email)
5. Guarda

## Endpoints Disponibles

### 1. Registro con Email/Password
```
POST /api/v1/auth/register
Body: {
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@test.com",
  "password": "Password123"
}
```

### 2. Login con Email/Password
```
POST /api/v1/auth/login
Body: {
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

### 3. Login con Google

**Desde el Cliente (Frontend):**
```javascript
// 1. El cliente hace login con Google usando Firebase SDK
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const provider = new GoogleAuthProvider();
const result = await signInWithPopup(auth, provider);
const idToken = await result.user.getIdToken();

// 2. Envía el ID token al backend
POST /api/v1/auth/login/google
Body: {
  "idToken": "eyJhbGciOiJSUzI1NiIs..."
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "abc123xyz",
      "email": "usuario@gmail.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      "role": "client",
      "avatar": "https://lh3.googleusercontent.com/..."
    },
    "firebaseUid": "abc123xyz",
    "idToken": "eyJhbGciOiJSUzI1NiIs..."
  }
}
```

### 4. Verificar Token (Cualquier método)
```
POST /api/v1/auth/verify-token
Body: {
  "idToken": "tu_token_aqui"
}
```

## Flujo Completo

### Opción A: Email/Password

1. **Cliente registra usuario:**
   - Frontend: Usa Firebase SDK `createUserWithEmailAndPassword()`
   - O Backend: `POST /api/v1/auth/register`

2. **Cliente hace login:**
   - Frontend: Usa Firebase SDK `signInWithEmailAndPassword()`
   - O Backend: `POST /api/v1/auth/login` (retorna customToken)

3. **Cliente obtiene ID token:**
   ```javascript
   const user = auth.currentUser;
   const idToken = await user.getIdToken();
   ```

4. **Cliente envía requests:**
   ```
   Authorization: Bearer {idToken}
   ```

### Opción B: Google Sign-In

1. **Cliente hace login con Google:**
   ```javascript
   import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
   
   const provider = new GoogleAuthProvider();
   const result = await signInWithPopup(auth, provider);
   const idToken = await result.user.getIdToken();
   ```

2. **Cliente envía ID token al backend:**
   ```
   POST /api/v1/auth/login/google
   Body: { "idToken": "..." }
   ```

3. **Backend crea/actualiza perfil en Firestore**

4. **Cliente usa el ID token en requests:**
   ```
   Authorization: Bearer {idToken}
   ```

## Para Postman (Desarrollo)

### Email/Password:
1. `POST /api/v1/auth/register` → Obtienes `customToken`
2. Usa `customToken` en header: `Authorization: Bearer {customToken}`

### Google (simulado):
1. Obtén un ID token de Google desde el cliente
2. `POST /api/v1/auth/login/google` con el `idToken`
3. Usa el `idToken` en header: `Authorization: Bearer {idToken}`

## Ventajas

✅ **Un solo sistema de autenticación** - Firebase Auth maneja ambos métodos
✅ **Tokens unificados** - Mismo formato de token para ambos
✅ **Datos sincronizados** - Perfiles en Firestore para ambos métodos
✅ **Seguridad** - Firebase maneja todo de forma segura

## Estructura de Datos

### Firebase Authentication
- Email/Password: email, password (hasheada), UID
- Google: email, UID, photoURL, displayName

### Firestore (colección `users`)
- ID = UID de Firebase Auth
- firstName, lastName, phone, address, role, avatar, etc.

## Configuración de Dominios Autorizados

Para Google Sign-In, asegúrate de que tu dominio esté autorizado:
1. Ve a: https://console.firebase.google.com/project/computedemo-9869e/authentication/settings
2. En "Authorized domains", agrega tu dominio si es necesario
3. `localhost` ya está incluido por defecto

