# Guía para Crear la Base de Datos WebComputo

## ⚠️ IMPORTANTE: Si phpMyAdmin no funciona

Si obtienes el error **"ERR_CONNECTION_REFUSED"** al acceder a `localhost/phpmyadmin`, significa que no tienes un servidor web con PHP instalado (como XAMPP o WAMP).

**Ver las soluciones alternativas:** Lee el archivo `SOLUCION_BASE_DATOS.md` que incluye:
- Cómo instalar XAMPP (incluye MySQL + phpMyAdmin)
- Cómo instalar MySQL + Workbench
- Cómo usar Docker
- Opciones en la nube

---

## 📋 Opción 1: Usando phpMyAdmin (Interfaz Web)

**REQUIERE**: XAMPP, WAMP, o servidor con PHP instalado

### Paso 1: Acceder a phpMyAdmin
1. Abre tu navegador web
2. Ve a la dirección donde está configurado phpMyAdmin (normalmente `http://localhost/phpmyadmin`)
3. Inicia sesión con tus credenciales de MySQL:
   - **Usuario**: `root` (o el que tengas configurado)
   - **Contraseña**: tu contraseña de MySQL

### Paso 2: Crear la Base de Datos
1. En el panel izquierdo de phpMyAdmin, haz clic en el botón **"Nuevo"** o **"New"**
2. En el campo **"Nombre de la base de datos"**, ingresa: `webcomputo_db`
3. En **"Cotejamiento"** (Collation), selecciona: `utf8mb4_unicode_ci` o `utf8mb4_general_ci`
4. Haz clic en el botón **"Crear"** o **"Create"**

### Paso 3: Configurar el archivo .env
1. En tu proyecto, crea un archivo `.env` copiando el ejemplo:
   ```bash
   cp env.example .env
   ```
2. Edita el archivo `.env` y configura las credenciales de tu base de datos:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=webcomputo_db
   DB_USER=root
   DB_PASSWORD=tu_contraseña_mysql_aqui
   ```

### Paso 4: Ejecutar las Migraciones
1. Abre la terminal en la carpeta del proyecto
2. Ejecuta el comando para crear todas las tablas:
   ```bash
   npm run migrate
   ```

### Paso 5: Ejecutar los Seeders (Datos Iniciales)
1. Ejecuta el comando para cargar datos de prueba:
   ```bash
   npm run seed
   ```

### Paso 6: Verificar la Base de Datos
1. Vuelve a phpMyAdmin
2. Selecciona la base de datos `webcomputo_db` en el panel izquierdo
3. Deberías ver las siguientes tablas creadas:
   - `users` - Usuarios del sistema
   - `categories` - Categorías de productos
   - `products` - Productos
   - `orders` - Órdenes de compra
   - `order_items` - Items de cada orden
   - `cart` - Carrito de compras
   - `SequelizeMeta` - Tabla de control de migraciones

---

## 📋 Opción 2: Usando MySQL Workbench

### Paso 1: Abrir MySQL Workbench
1. Inicia MySQL Workbench
2. Conecta a tu servidor MySQL local

### Paso 2: Crear la Base de Datos
1. Haz clic en el botón **"Create a new schema"** o presiona `Ctrl + T`
2. En el campo **"Name"**, ingresa: `webcomputo_db`
3. En **"Collation"**, selecciona: `utf8mb4_unicode_ci`
4. Haz clic en **"Apply"**
5. Confirma la creación con **"Apply"** y luego **"Finish"**

### Paso 3: Crear las Tablas
1. Selecciona la base de datos `webcomputo_db` haciendo doble clic
2. Ejecuta las migraciones desde la terminal del proyecto:
   ```bash
   npm run migrate
   ```

### Paso 4: Cargar Datos Iniciales
```bash
npm run seed
```

---

## 📋 Opción 3: Usando SQL Directo (Recomendado)

### Paso 1: Abrir phpMyAdmin o MySQL Workbench

### Paso 2: Ejecutar el SQL
1. Ve a la pestaña **"SQL"** en phpMyAdmin o crea una nueva consulta en MySQL Workbench
2. Copia y pega este comando:
   ```sql
   CREATE DATABASE IF NOT EXISTS webcomputo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Ejecuta el comando (haz clic en **"Ejecutar"** o presiona `Ctrl + Enter`)

### Paso 3: Ejecutar las Migraciones
Desde la terminal:
```bash
npm run migrate
npm run seed
```

---

## 🔐 Usuario Administrador Por Defecto

Después de ejecutar `npm run seed`, tendrás un usuario administrador creado:

- **Email**: `admin@webcomputo.com`
- **Contraseña**: `admin123`
- **Rol**: Administrador

⚠️ **IMPORTANTE**: Cambia esta contraseña inmediatamente en producción.

---

## ❓ Solución de Problemas Comunes

### Error: "Access denied for user"
- Verifica que el usuario y contraseña en `.env` sean correctos
- Asegúrate de que el usuario tenga permisos para crear bases de datos

### Error: "Can't connect to MySQL server"
- Verifica que el servicio de MySQL esté corriendo
- Revisa que el puerto (3306) sea correcto en `.env`
- Verifica que el host sea correcto (localhost o IP del servidor)

### Error: "Database already exists"
- Elimina la base de datos existente desde phpMyAdmin
- O cambia el nombre en `.env` por uno diferente

---

## 📝 Notas Importantes

1. **Backup**: Siempre haz un respaldo de tu base de datos antes de hacer cambios importantes
2. **Seguridad**: Nunca compartas tu archivo `.env` con información sensible
3. **Permisos**: Asegúrate de que el usuario de MySQL tenga los permisos necesarios
4. **Cotejamiento**: Usa `utf8mb4` para soportar caracteres especiales y emojis

---

## 🚀 Siguiente Paso

Una vez creada la base de datos y ejecutadas las migraciones, inicia el servidor:

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

