# Debug de Token - Guía de Solución de Problemas

## Problema: "Token inválido o expirado"

Si estás recibiendo este error después de hacer login, sigue estos pasos:

### 1. Verificar que el token se guardó correctamente

En Postman, después de hacer login:
1. Ve a la pestaña "Tests" del request de Login
2. Verifica que el script esté guardando el token:
   ```javascript
   if (pm.response.code === 200) {
       var jsonData = pm.response.json();
       if (jsonData.data) {
           var token = jsonData.data.idToken || jsonData.data.customToken;
           if (token) {
               pm.environment.set("token", token);
           }
       }
   }
   ```

### 2. Verificar el tipo de token

**IMPORTANTE:** El middleware solo acepta **ID tokens**, no customTokens.

- ✅ **ID Token**: Empieza con `eyJhbGciOiJSUzI1NiIs...` (más largo)
- ❌ **Custom Token**: También empieza con `eyJhbGciOiJSUzI1NiIs...` pero no funciona con `verifyIdToken`

### 3. Verificar el header

Asegúrate de que el header esté configurado así:
```
Authorization: Bearer {{token}}
```

**NO:**
- `Authorization: {{token}}` (falta "Bearer ")
- `Authorization: Bearer{{token}}` (falta espacio)

### 4. Verificar los logs del servidor

Revisa la consola del servidor. Deberías ver:
- ✅ `CustomToken intercambiado exitosamente por ID token` - Todo bien
- ❌ `Error al intercambiar customToken por ID token` - Hay un problema

### 5. Solución: Reiniciar el servidor

Si el intercambio está fallando:
1. Detén el servidor (Ctrl+C)
2. Reinicia: `npm run dev`
3. Intenta hacer login nuevamente

### 6. Verificar la API Key de Firebase

El intercambio de customToken por idToken requiere la API Key de Firebase. Verifica que esté en `src/config/firebase.js`:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDznJCcPwzkafyN0ZckXvOINsEhei9tlqQ",
  // ...
};
```

### 7. Probar manualmente el intercambio

Si el problema persiste, puedes probar el intercambio manualmente:

```bash
curl -X POST "https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=TU_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "TU_CUSTOM_TOKEN",
    "returnSecureToken": true
  }'
```

### 8. Usar el endpoint de verificación

Si tienes un token pero no estás seguro si es válido:
```
POST /api/v1/auth/verify-token
Body: {
  "idToken": "tu_token_aqui"
}
```

### 9. Solución alternativa: Usar Firebase SDK en el cliente

Si el intercambio sigue fallando, la mejor solución es usar Firebase SDK en el cliente:

```javascript
// En el cliente (frontend)
import { signInWithEmailAndPassword } from 'firebase/auth';

const userCredential = await signInWithEmailAndPassword(auth, email, password);
const idToken = await userCredential.user.getIdToken();

// Enviar idToken al backend
fetch('/api/v1/products', {
  headers: {
    'Authorization': `Bearer ${idToken}`
  }
});
```

## Errores comunes

### Error: "INVALID_CUSTOM_TOKEN"
- El customToken es inválido o expirado
- Solución: Hacer login nuevamente

### Error: "auth/argument-error"
- Estás usando un customToken en lugar de un idToken
- Solución: Asegúrate de que el login retorne un idToken

### Error: "auth/id-token-expired"
- El token ha expirado (típicamente después de 1 hora)
- Solución: Hacer login nuevamente

## Verificación rápida

1. ✅ ¿El servidor está corriendo?
2. ✅ ¿Hiciste login y obtuviste un token?
3. ✅ ¿El token está en la variable `{{token}}`?
4. ✅ ¿El header es `Authorization: Bearer {{token}}`?
5. ✅ ¿El token es un idToken (no customToken)?

Si todos son ✅, el problema puede ser:
- El token expiró (haz login nuevamente)
- El usuario está inactivo en Firestore
- Hay un problema con Firebase Auth












