# Índices Requeridos en Firestore

Firestore requiere índices compuestos cuando usas múltiples `where` o combinas `where` con `orderBy` en diferentes campos.

## Solución Rápida

El error proporciona un enlace directo para crear el índice. Haz clic en el enlace del error o ve a:

**Enlace directo para crear el índice:**
https://console.firebase.google.com/v1/r/project/computedemo-9869e/firestore/indexes?create_composite=ClJwcm9qZWN0cy9jb21wdXRlZGVtby05ODY5ZS9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvcHJvZHVjdHMvaW5kZXhlcy9fEAEaDAoIaXNBY3RpdmUQARoNCgljcmVhdGVkQXQQAhoMCghfX25hbWVfXxAC

O ve manualmente a:
https://console.firebase.google.com/project/computedemo-9869e/firestore/indexes

## Índices Necesarios

### 1. Índice para productos activos ordenados por createdAt
- **Colección:** `products`
- **Campos:**
  - `isActive` (Ascending)
  - `createdAt` (Ascending)

### 2. Índice para productos activos ordenados por createdAt (descendente)
- **Colección:** `products`
- **Campos:**
  - `isActive` (Ascending)
  - `createdAt` (Descending)

### 3. Índice para productos por categoría y activos
- **Colección:** `products`
- **Campos:**
  - `isActive` (Ascending)
  - `categoryId` (Ascending)
  - `createdAt` (Ascending)

### 4. Índice para productos destacados
- **Colección:** `products`
- **Campos:**
  - `isActive` (Ascending)
  - `isFeatured` (Ascending)
  - `createdAt` (Ascending)

### 5. Índice para categorías activas ordenadas por nombre
- **Colección:** `categories`
- **Campos:**
  - `isActive` (Ascending)
  - `name` (Ascending)
- **Enlace directo:** El error proporcionará un enlace cuando sea necesario

## Crear Índices Manualmente

1. Ve a: https://console.firebase.google.com/project/computedemo-9869e/firestore/indexes
2. Haz clic en "Create Index"
3. Configura:
   - **Collection ID:** `products`
   - **Fields to index:** Agrega los campos necesarios
   - **Query scope:** Collection
4. Haz clic en "Create"

## Nota Importante

Los índices pueden tardar unos minutos en crearse. Firestore te notificará cuando estén listos.

## Alternativa: Simplificar Consultas

Si prefieres evitar crear muchos índices, puedes:
1. Obtener todos los productos
2. Filtrar en memoria (solo para pequeñas cantidades de datos)
3. Ordenar en memoria

Sin embargo, esto no es eficiente para grandes volúmenes de datos.

## Verificar Índices Existentes

Puedes ver todos los índices en:
https://console.firebase.google.com/project/computedemo-9869e/firestore/indexes

