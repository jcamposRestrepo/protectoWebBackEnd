# Soluciones para Crear la Base de Datos WebComputo

## ⚠️ Problema Detectado
No tienes phpMyAdmin instalado. Esto es normal si solo tienes Node.js sin un servidor web (XAMPP, WAMP, etc.).

---

## 🎯 Solución Rápida: Instalar XAMPP (Más Fácil)

XAMPP incluye MySQL y phpMyAdmin:

1. **Descarga XAMPP**:
   - Ve a: https://www.apachefriends.org/download.html
   - Descarga la versión para Windows
   - Instala XAMPP

2. **Inicia los servicios**:
   - Abre el "Panel de Control de XAMPP"
   - Inicia el módulo **"Apache"**
   - Inicia el módulo **"MySQL"**

3. **Accede a phpMyAdmin**:
   - Abre tu navegador
   - Ve a: `http://localhost/phpmyadmin`
   - Usuario: `root`
   - Contraseña: (deja en blanco por defecto)

4. **Crea la base de datos**:
   - Clic en "Nuevo" en el panel izquierdo
   - Nombre: `webcomputo_db`
   - Collation: `utf8mb4_unicode_ci`
   - Clic en "Crear"

5. **Ejecuta las migraciones**:
   ```bash
   npm run migrate
   npm run seed
   ```

---

## 🎯 Alternativa: Instalar MySQL Solo

1. **Descarga MySQL Community Server**:
   - Ve a: https://dev.mysql.com/downloads/mysql/
   - Descarga MySQL Installer para Windows
   - Instala MySQL

2. **Durante la instalación**:
   - Configura la contraseña del usuario `root`
   - Anota la contraseña

3. **Descarga MySQL Workbench**:
   - Ve a: https://dev.mysql.com/downloads/workbench/
   - Descarga e instala MySQL Workbench

4. **Crea la base de datos con Workbench**:
   - Abre MySQL Workbench
   - Conecta a tu servidor local
   - Clic en el icono "Create a new schema"
   - Nombre: `webcomputo_db`
   - Collation: `utf8mb4_unicode_ci`
   - Clic en "Apply"

5. **Actualiza el archivo `.env`**:
   ```env
   DB_PASSWORD=tu_contraseña_mysql
   ```

6. **Ejecuta las migraciones**:
   ```bash
   npm run migrate
   npm run seed
   ```

---

## 🎯 Alternativa: Usar MySQL en Docker

Si tienes Docker instalado:

```bash
# Inicia MySQL en Docker
docker run --name mysql-webcomputo -e MYSQL_ROOT_PASSWORD=root123 -e MYSQL_DATABASE=webcomputo_db -p 3306:3306 -d mysql:8.0

# Espera unos segundos y ejecuta las migraciones
npm run migrate
npm run seed
```

Actualiza tu `.env`:
```env
DB_PASSWORD=root123
```

---

## 🎯 Alternativa Rápida: Cloud (Paso a Paso Simplificado)

### Opción A: MySQL en PlanetScale (Gratis)

1. Ve a: https://planetscale.com
2. Crea una cuenta gratuita
3. Crea una nueva base de datos llamada `webcomputo_db`
4. Copia la cadena de conexión que te proporciona
5. Actualiza tu `.env` con los datos de conexión

### Opción B: MySQL en Railsway (Gratis)

1. Ve a: https://railway.app
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto MySQL
4. Copia la cadena de conexión
5. Actualiza tu `.env` con los datos de conexión

---

## 📋 Cómo Actualizar el archivo .env

Después de tener MySQL funcionando:

1. Edita el archivo `.env` (está en la raíz del proyecto)
2. Actualiza la línea `DB_PASSWORD`:
   ```env
   DB_PASSWORD=tu_contraseña_aqui
   ```
3. Si usas XAMPP sin contraseña, deja `DB_PASSWORD=` vacío
4. Guarda el archivo

---

## 🚀 Comandos para Ejecutar

Una vez que tengas MySQL funcionando y el `.env` configurado:

```bash
# Crear las tablas
npm run migrate

# Cargar datos iniciales
npm run seed

# Iniciar el servidor
npm run dev
```

---

## ✅ Verificación

Tu servidor debería estar corriendo en: `http://localhost:3000`

Usuario administrador por defecto:
- Email: `admin@webcomputo.com`
- Contraseña: `admin123`

---

## 🆘 ¿Cuál opción elegir?

- **Principiante**: Instala XAMPP (opción más fácil)
- **Experiencia media**: Instala MySQL + Workbench
- **Avanzado**: Usa Docker
- **Práctica profesional**: Usa un servicio en la nube

---

## 📞 Si sigues con problemas

Comparte el error específico y te ayudaré a resolverlo.

