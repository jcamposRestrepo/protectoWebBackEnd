# Configurar Firebase Authentication

## Paso 1: Habilitar Email/Password en Firebase Console

1. Ve a: https://console.firebase.google.com/project/computedemo-9869e/authentication
2. Haz clic en "Get started" si es la primera vez
3. Ve a la pestaña "Sign-in method"
4. Haz clic en "Email/Password"
5. Habilita "Email/Password" (primer toggle)
6. (Opcional) Habilita "Email link (passwordless sign-in)" si lo deseas
7. Haz clic en "Save"

## Paso 2: Probar el Registro

Una vez habilitado Email/Password, puedes probar el registro:

**En Postman:**
```
POST http://localhost:3001/api/v1/auth/register
Body: {
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@test.com",
  "password": "Password123"
}
```

**Respuesta esperada:**
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

## Paso 3: Usar el Token

El `customToken` que recibes puede usarse directamente en el header:

```
Authorization: Bearer {customToken}
```

## Verificar Usuarios en Firebase Console

Puedes ver todos los usuarios registrados en:
https://console.firebase.google.com/project/computedemo-9869e/authentication/users

## Notas Importantes

- **Firebase Auth maneja las contraseñas** - No se almacenan en Firestore
- **Los datos adicionales** (firstName, lastName, etc.) se guardan en Firestore
- **El UID de Firebase Auth** se usa como ID del documento en Firestore
- **El customToken** puede usarse directamente, pero en producción es mejor usar ID tokens del cliente

## Solución de Problemas

### Error: "auth/email-already-exists"
- El usuario ya existe en Firebase Auth
- Intenta con otro email o elimina el usuario desde Firebase Console

### Error: "auth/invalid-email"
- El formato del email no es válido
- Verifica que el email tenga formato correcto

### Error: "auth/weak-password"
- La contraseña es muy débil
- Firebase requiere contraseñas de al menos 6 caracteres
- Usa una contraseña más fuerte

### El token no funciona
- Verifica que hayas copiado el `customToken` completo
- Asegúrate de que el header sea: `Authorization: Bearer {token}`
- Verifica que el servidor esté corriendo

