# Instrucciones para Obtener Credenciales de Firebase Admin

## Problema
Firebase Admin SDK requiere credenciales de servicio para funcionar. Las credenciales que proporcionaste son del SDK web (cliente), no del Admin SDK (servidor).

## Solución: Obtener Credenciales de Servicio

### Paso 1: Ir a Firebase Console
1. Ve a: https://console.firebase.google.com/
2. Selecciona tu proyecto: **computedemo-9869e**

### Paso 2: Obtener Credenciales de Servicio
1. Haz clic en el ícono de configuración (⚙️) en la parte superior izquierda
2. Selecciona **"Project settings"**
3. Ve a la pestaña **"Service accounts"**
4. Haz clic en el botón **"Generate new private key"**
5. Se descargará un archivo JSON con las credenciales

### Paso 3: Guardar el Archivo
1. Renombra el archivo descargado a: `firebase-service-account.json`
2. Colócalo en la **raíz del proyecto** (misma carpeta donde está `package.json`)
3. **IMPORTANTE**: Agrega este archivo a `.gitignore` para no subirlo a Git

### Paso 4: Configurar (Opcional)
Si quieres usar una ruta diferente, puedes configurar la variable de entorno:

**Windows (PowerShell):**
```powershell
$env:FIREBASE_SERVICE_ACCOUNT_PATH="./ruta/al/archivo.json"
```

**Windows (CMD):**
```cmd
set FIREBASE_SERVICE_ACCOUNT_PATH=./ruta/al/archivo.json
```

**Linux/Mac:**
```bash
export FIREBASE_SERVICE_ACCOUNT_PATH=./ruta/al/archivo.json
```

O agrega al archivo `.env`:
```
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

## Estructura del Archivo de Credenciales

El archivo JSON descargado tiene esta estructura:
```json
{
  "type": "service_account",
  "project_id": "computedemo-9869e",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

## Verificar que Funciona

Después de colocar el archivo, reinicia el servidor:
```bash
npm start
```

Deberías ver:
```
✅ Firebase Admin inicializado con credenciales desde archivo por defecto
```

## Seguridad

⚠️ **NUNCA subas el archivo de credenciales a Git**

Asegúrate de que `.gitignore` incluya:
```
firebase-service-account.json
*.json
!package.json
!package-lock.json
```

## Alternativa: Variable de Entorno

Si prefieres no tener el archivo en el proyecto, puedes:

1. Copiar el contenido del archivo JSON
2. Configurar la variable de entorno `FIREBASE_SERVICE_ACCOUNT_KEY` con el contenido completo del JSON (como string)

**Ejemplo en `.env`:**
```
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"computedemo-9869e",...}
```

## Enlaces Útiles

- Firebase Console: https://console.firebase.google.com/
- Tu proyecto: https://console.firebase.google.com/project/computedemo-9869e
- Service Accounts: https://console.firebase.google.com/project/computedemo-9869e/settings/serviceaccounts/adminsdk

