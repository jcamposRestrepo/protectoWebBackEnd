# Migración a Firebase Firestore

Este proyecto ha sido migrado de Sequelize/SQL a Firebase Firestore.

## Cambios Realizados

### 1. Configuración de Firebase
- ✅ Archivo de configuración creado: `src/config/firebase.js`
- ✅ Credenciales de Firebase configuradas
- ✅ Firebase Admin SDK inicializado

### 2. Servicios de Firestore
Se han creado servicios para reemplazar los modelos de Sequelize:
- ✅ `src/services/firestore/productService.js` - Gestión de productos
- ✅ `src/services/firestore/userService.js` - Gestión de usuarios
- ✅ `src/services/firestore/categoryService.js` - Gestión de categorías
- ✅ `src/services/firestore/orderService.js` - Gestión de órdenes
- ✅ `src/services/firestore/orderItemService.js` - Gestión de items de orden
- ✅ `src/services/firestore/cartService.js` - Gestión de carrito

### 3. Controladores Actualizados
- ✅ `src/controllers/authController.js` - Actualizado para usar Firestore
- ✅ `src/controllers/productController.js` - Actualizado para usar Firestore
- ⚠️ `src/controllers/categoryController.js` - Pendiente de actualizar
- ⚠️ `src/controllers/orderController.js` - Pendiente de actualizar
- ⚠️ `src/controllers/cartController.js` - Pendiente de actualizar
- ⚠️ `src/controllers/userController.js` - Pendiente de actualizar

### 4. Aplicación Principal
- ✅ `src/app.js` - Actualizado para inicializar Firebase en lugar de Sequelize

## Configuración de Firebase

### Opción 1: Usar Application Default Credentials (Recomendado para desarrollo)
Para desarrollo local, puedes usar las credenciales del proyecto directamente. El archivo `firebase.js` ya está configurado para esto.

### Opción 2: Usar archivo de credenciales de servicio (Recomendado para producción)
1. Ve a Firebase Console > Project Settings > Service Accounts
2. Haz clic en "Generate new private key"
3. Descarga el archivo JSON
4. Configura la variable de entorno:
   ```bash
   FIREBASE_SERVICE_ACCOUNT_PATH=./path/to/serviceAccountKey.json
   ```

O configura la variable de entorno con el contenido del JSON:
```bash
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
```

## Estructura de Colecciones en Firestore

Las siguientes colecciones deben crearse en Firestore:

1. **products** - Productos del catálogo
2. **users** - Usuarios del sistema
3. **categories** - Categorías de productos
4. **orders** - Órdenes de compra
5. **orderItems** - Items de cada orden
6. **cart** - Carrito de compras

## Notas Importantes

### Diferencias entre SQL y Firestore

1. **IDs**: Firestore usa IDs de cadena generados automáticamente, no enteros autoincrementales
2. **Relaciones**: Firestore no tiene JOINs. Las relaciones se manejan con referencias (IDs) o subcolecciones
3. **Consultas**: Las consultas complejas pueden requerir múltiples lecturas o índices compuestos
4. **Transacciones**: Firestore tiene transacciones pero son más limitadas que SQL

### Índices Necesarios

Firestore puede requerir índices compuestos para ciertas consultas. Si ves errores sobre índices faltantes, créalos desde la consola de Firebase o sigue las instrucciones en los mensajes de error.

### Migración de Datos

Si tienes datos existentes en SQL, necesitarás crear un script de migración para:
1. Leer datos de la base de datos SQL
2. Transformarlos al formato de Firestore
3. Escribirlos en Firestore

## Próximos Pasos

1. Actualizar los controladores restantes (category, order, cart, user)
2. Probar todas las funcionalidades
3. Crear índices necesarios en Firestore
4. Migrar datos existentes si los hay
5. Configurar reglas de seguridad de Firestore

## Comandos Útiles

```bash
# Iniciar servidor
npm start

# Iniciar en modo desarrollo
npm run dev
```

## Soporte

Si encuentras problemas, revisa:
- Los logs del servidor
- La consola de Firebase
- Los mensajes de error de Firestore sobre índices faltantes

