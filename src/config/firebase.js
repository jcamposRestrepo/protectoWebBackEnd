const admin = require('firebase-admin');

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDznJCcPwzkafyN0ZckXvOINsEhei9tlqQ",
  authDomain: "computedemo-9869e.firebaseapp.com",
  projectId: "computedemo-9869e",
  storageBucket: "computedemo-9869e.firebasestorage.app",
  messagingSenderId: "1013757139034",
  appId: "1:1013757139034:web:d2f3e22e690bb56e3d6063",
  measurementId: "G-Z13P0C0KLP"
};

// Inicializar Firebase Admin SDK
// IMPORTANTE: Firebase Admin requiere credenciales de servicio
// Para obtenerlas:
// 1. Ve a https://console.firebase.google.com/
// 2. Selecciona tu proyecto: computedemo-9869e
// 3. Ve a Project Settings (⚙️) > Service Accounts
// 4. Haz clic en "Generate new private key"
// 5. Descarga el archivo JSON y guárdalo como: firebase-service-account.json
// 6. Configura la variable de entorno: FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

let firebaseApp;

try {
  // Intentar inicializar con credenciales de servicio si están disponibles
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    // Opción 1: Credenciales desde variable de entorno (JSON string)
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket
    });
    console.log('✅ Firebase Admin inicializado con credenciales desde variable de entorno');
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    // Opción 2: Credenciales desde archivo
    const path = require('path');
    const serviceAccountPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    const serviceAccount = require(serviceAccountPath);
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket
    });
    console.log('✅ Firebase Admin inicializado con credenciales desde archivo');
  } else {
    // Opción 3: Intentar con archivo por defecto en la raíz del proyecto
    const path = require('path');
    const fs = require('fs');
    const defaultPath = path.resolve(__dirname, '../../firebase-service-account.json');
    
    if (fs.existsSync(defaultPath)) {
      const serviceAccount = require(defaultPath);
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: firebaseConfig.projectId,
        storageBucket: firebaseConfig.storageBucket
      });
      console.log('✅ Firebase Admin inicializado con credenciales desde archivo por defecto');
    } else {
      // Si no hay credenciales, mostrar error claro
      throw new Error(
        '❌ Firebase Admin requiere credenciales de servicio.\n' +
        'Por favor, descarga el archivo de credenciales desde Firebase Console:\n' +
        '1. Ve a: https://console.firebase.google.com/project/computedemo-9869e/settings/serviceaccounts/adminsdk\n' +
        '2. Haz clic en "Generate new private key"\n' +
        '3. Guarda el archivo JSON como: firebase-service-account.json en la raíz del proyecto\n' +
        'O configura la variable de entorno: FIREBASE_SERVICE_ACCOUNT_PATH=./ruta/al/archivo.json'
      );
    }
  }
} catch (error) {
  console.error('❌ Error al inicializar Firebase Admin:', error.message);
  throw error;
}

// Obtener instancias de Firestore y Storage
const db = admin.firestore();
const storage = admin.storage();
const auth = admin.auth();

// Configurar Firestore
db.settings({ 
  ignoreUndefinedProperties: true
});

module.exports = {
  admin,
  db,
  storage,
  auth,
  firebaseApp,
  firebaseConfig
};

