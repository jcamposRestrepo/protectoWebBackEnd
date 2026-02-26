const { db } = require('../../config/firebase');
const bcrypt = require('bcryptjs');

/**
 * Servicio para manejar operaciones de productos en Firestore
 */
class ProductService {
  static COLLECTION = 'products';

  /**
   * Convertir documento de Firestore a objeto JavaScript
   */
  static docToObject(doc) {
    if (!doc.exists) return null;
    return {
      id: doc.id,
      ...doc.data()
    };
  }

  /**
   * Crear un nuevo producto
   */
  static async create(productData) {
    try {
      // Generar slug si no existe
      if (!productData.slug) {
        productData.slug = await this.generateSlug(productData.name);
      }

      // Generar SKU si no existe
      if (!productData.sku) {
        productData.sku = await this.generateSKU(productData.name, productData.categoryId);
      }

      // Asegurar valores por defecto
      productData.isActive = productData.isActive !== undefined ? productData.isActive : true;
      productData.isFeatured = productData.isFeatured !== undefined ? productData.isFeatured : false;
      productData.inStock = productData.inStock !== undefined ? productData.inStock : true;
      productData.stock = productData.stock !== undefined ? productData.stock : 0;
      productData.minStock = productData.minStock !== undefined ? productData.minStock : 5;
      productData.images = productData.images || [];
      productData.specifications = productData.specifications || {};
      productData.tags = productData.tags || [];
      productData.productType = productData.productType || 'componente';
      productData.createdAt = new Date();
      productData.updatedAt = new Date();

      // Convertir precios a números
      if (productData.price) productData.price = parseFloat(productData.price);
      if (productData.comparePrice) productData.comparePrice = parseFloat(productData.comparePrice);

      const docRef = await db.collection(this.COLLECTION).add(productData);
      const doc = await docRef.get();
      
      return {
        success: true,
        data: this.docToObject(doc)
      };
    } catch (error) {
      throw new Error(`Error al crear producto: ${error.message}`);
    }
  }

  /**
   * Obtener producto por ID
   */
  static async findById(id, includeInactive = false) {
    try {
      const doc = await db.collection(this.COLLECTION).doc(id).get();
      
      if (!doc.exists) {
        throw new Error('Producto no encontrado');
      }

      const product = this.docToObject(doc);
      
      if (!includeInactive && !product.isActive) {
        throw new Error('Producto no encontrado');
      }

      return {
        success: true,
        data: product
      };
    } catch (error) {
      throw new Error(`Error al obtener producto: ${error.message}`);
    }
  }

  /**
   * Obtener producto por slug
   */
  static async findBySlug(slug) {
    try {
      const snapshot = await db.collection(this.COLLECTION)
        .where('slug', '==', slug)
        .where('isActive', '==', true)
        .limit(1)
        .get();

      if (snapshot.empty) {
        throw new Error('Producto no encontrado');
      }

      const doc = snapshot.docs[0];
      return {
        success: true,
        data: this.docToObject(doc)
      };
    } catch (error) {
      throw new Error(`Error al obtener producto: ${error.message}`);
    }
  }

  /**
   * Buscar productos con filtros y paginación
   */
  static async findAll(filters = {}, pagination = {}, includeInactive = false) {
    try {
      // Solución temporal: Obtener todos los productos y filtrar/ordenar en memoria
      // Esto funciona sin índices pero es menos eficiente para grandes volúmenes
      // TODO: Crear índices en Firestore para mejor rendimiento
      
      let query = db.collection(this.COLLECTION);
      
      // Intentar usar consulta optimizada con índices
      let useOptimizedQuery = true;
      let snapshot;
      
      try {
        // Construir consulta optimizada
        if (!includeInactive) {
          query = query.where('isActive', '==', true);
        }

        if (filters.category) {
          query = query.where('categoryId', '==', filters.category);
        }

        if (filters.productType) {
          query = query.where('productType', '==', filters.productType);
        }

        if (filters.featured !== undefined) {
          query = query.where('isFeatured', '==', filters.featured === 'true' || filters.featured === true);
        }

        if (filters.inStock === 'true') {
          query = query.where('inStock', '==', true);
        }

        // Ordenamiento
        const sortBy = filters.sortBy || 'createdAt';
        const sortOrder = filters.sortOrder || 'desc';
        query = query.orderBy(sortBy, sortOrder.toLowerCase());

        // Intentar ejecutar la consulta
        snapshot = await query.get();
        useOptimizedQuery = true;
      } catch (error) {
        // Si falla por falta de índice, usar método alternativo
        if (error.message && error.message.includes('index')) {
          console.warn('⚠️ Índice no encontrado, usando método alternativo. Crea el índice para mejor rendimiento.');
          useOptimizedQuery = false;
          
          // Obtener todos los productos sin filtros complejos
          query = db.collection(this.COLLECTION);
          snapshot = await query.get();
        } else {
          throw error;
        }
      }

      // Convertir a objetos
      let allProducts = snapshot.docs.map(doc => this.docToObject(doc));

      // Aplicar filtros en memoria si no se usó consulta optimizada
      if (!useOptimizedQuery) {
        // Filtro de activo
        if (!includeInactive) {
          allProducts = allProducts.filter(p => p.isActive === true);
        }

        // Filtros
        if (filters.category) {
          allProducts = allProducts.filter(p => p.categoryId === filters.category);
        }

        if (filters.productType) {
          allProducts = allProducts.filter(p => p.productType === filters.productType);
        }

        if (filters.featured !== undefined) {
          const featuredValue = filters.featured === 'true' || filters.featured === true;
          allProducts = allProducts.filter(p => p.isFeatured === featuredValue);
        }

        if (filters.inStock === 'true') {
          allProducts = allProducts.filter(p => p.inStock === true);
        }

        // Ordenamiento en memoria
        const sortBy = filters.sortBy || 'createdAt';
        const sortOrder = filters.sortOrder || 'desc';
        allProducts.sort((a, b) => {
          const aVal = a[sortBy] || 0;
          const bVal = b[sortBy] || 0;
          
          if (sortOrder.toLowerCase() === 'desc') {
            return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
          } else {
            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
          }
        });
      }

      // Aplicar filtros de búsqueda y precio en memoria (siempre en memoria)
      let filteredProducts = allProducts;

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
          p.name?.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          p.brand?.toLowerCase().includes(searchLower) ||
          p.model?.toLowerCase().includes(searchLower)
        );
      }

      if (filters.minPrice) {
        filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(filters.minPrice));
      }

      if (filters.maxPrice) {
        filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(filters.maxPrice));
      }

      if (filters.brand) {
        const brandLower = filters.brand.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
          p.brand?.toLowerCase().includes(brandLower)
        );
      }

      // Paginación
      const page = parseInt(pagination.page) || 1;
      const limit = parseInt(pagination.limit) || 10;
      const totalItems = filteredProducts.length;
      const offset = (page - 1) * limit;
      
      // Aplicar paginación
      const paginatedProducts = filteredProducts.slice(offset, offset + limit);
      
      const totalPages = Math.ceil(totalItems / limit);

      return {
        success: true,
        data: {
          products: paginatedProducts,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        }
      };
    } catch (error) {
      throw new Error(`Error al obtener productos: ${error.message}`);
    }
  }

  /**
   * Actualizar producto
   */
  static async update(id, updateData) {
    try {
      const docRef = db.collection(this.COLLECTION).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new Error('Producto no encontrado');
      }

      // Actualizar slug si cambió el nombre
      if (updateData.name && !updateData.slug) {
        updateData.slug = await this.generateSlug(updateData.name);
      }

      updateData.updatedAt = new Date();

      // Convertir precios a números si existen
      if (updateData.price) updateData.price = parseFloat(updateData.price);
      if (updateData.comparePrice) updateData.comparePrice = parseFloat(updateData.comparePrice);

      await docRef.update(updateData);
      const updatedDoc = await docRef.get();

      return {
        success: true,
        data: this.docToObject(updatedDoc)
      };
    } catch (error) {
      throw new Error(`Error al actualizar producto: ${error.message}`);
    }
  }

  /**
   * Eliminar producto (soft delete)
   */
  static async delete(id) {
    try {
      return await this.update(id, { isActive: false });
    } catch (error) {
      throw new Error(`Error al eliminar producto: ${error.message}`);
    }
  }

  /**
   * Generar slug único
   */
  static async generateSlug(name) {
    if (!name) {
      throw new Error('El nombre es requerido para generar el slug');
    }

    let baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!baseSlug) {
      baseSlug = 'producto';
    }

    let slug = baseSlug;
    let counter = 0;

    while (counter < 100) {
      const snapshot = await db.collection(this.COLLECTION)
        .where('slug', '==', slug)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return slug;
      }

      counter++;
      slug = `${baseSlug}-${counter}`;
    }

    const timestamp = Date.now().toString().slice(-6);
    return `${baseSlug}-${timestamp}`;
  }

  /**
   * Generar SKU único
   */
  static async generateSKU(name, categoryId) {
    const namePrefix = name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 3)
      .padEnd(3, 'X');

    const timestamp = Date.now().toString().slice(-6);
    let sku = `${namePrefix}-${categoryId}-${timestamp}`;

    let counter = 0;
    while (counter < 10) {
      const snapshot = await db.collection(this.COLLECTION)
        .where('sku', '==', sku)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return sku;
      }

      sku = `${namePrefix}-${categoryId}-${timestamp}-${counter}`;
      counter++;
    }

    const crypto = require('crypto');
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `${namePrefix}-${categoryId}-${randomSuffix}`;
  }

  /**
   * Buscar producto por SKU
   */
  static async findBySku(sku) {
    try {
      const snapshot = await db.collection(this.COLLECTION)
        .where('sku', '==', sku)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      return this.docToObject(snapshot.docs[0]);
    } catch (error) {
      throw new Error(`Error al buscar producto por SKU: ${error.message}`);
    }
  }
}

module.exports = ProductService;

