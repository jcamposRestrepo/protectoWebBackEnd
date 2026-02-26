const { db } = require('../../config/firebase');

/**
 * Servicio para manejar operaciones de categorías en Firestore
 */
class CategoryService {
  static COLLECTION = 'categories';

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
   * Crear una nueva categoría
   */
  static async create(categoryData) {
    try {
      // Generar slug si no existe
      if (!categoryData.slug) {
        categoryData.slug = await this.generateSlug(categoryData.name);
      }

      // Verificar que el slug sea único
      const existing = await this.findBySlug(categoryData.slug);
      if (existing) {
        throw new Error('El slug ya está en uso');
      }

      // Valores por defecto
      categoryData.isActive = categoryData.isActive !== undefined ? categoryData.isActive : true;
      categoryData.createdAt = new Date();
      categoryData.updatedAt = new Date();

      const docRef = await db.collection(this.COLLECTION).add(categoryData);
      const doc = await docRef.get();
      
      return {
        success: true,
        data: this.docToObject(doc)
      };
    } catch (error) {
      throw new Error(`Error al crear categoría: ${error.message}`);
    }
  }

  /**
   * Obtener categoría por ID
   */
  static async findById(id, includeInactive = false) {
    try {
      const doc = await db.collection(this.COLLECTION).doc(id).get();
      
      if (!doc.exists) {
        throw new Error('Categoría no encontrada');
      }

      const category = this.docToObject(doc);
      
      if (!includeInactive && !category.isActive) {
        throw new Error('Categoría no encontrada');
      }

      return {
        success: true,
        data: category
      };
    } catch (error) {
      throw new Error(`Error al obtener categoría: ${error.message}`);
    }
  }

  /**
   * Obtener categoría por slug
   */
  static async findBySlug(slug) {
    try {
      const snapshot = await db.collection(this.COLLECTION)
        .where('slug', '==', slug)
        .where('isActive', '==', true)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      return this.docToObject(snapshot.docs[0]);
    } catch (error) {
      throw new Error(`Error al buscar categoría por slug: ${error.message}`);
    }
  }

  /**
   * Obtener todas las categorías
   */
  static async findAll(filters = {}, includeInactive = false) {
    try {
      // Solución temporal: Obtener todas las categorías y filtrar/ordenar en memoria
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

        // Filtro de categoría padre
        if (filters.parentId !== undefined) {
          if (filters.parentId === null) {
            query = query.where('parentId', '==', null);
          } else {
            query = query.where('parentId', '==', filters.parentId);
          }
        }

        // Ordenamiento
        query = query.orderBy('name', 'asc');

        // Intentar ejecutar la consulta
        snapshot = await query.get();
        useOptimizedQuery = true;
      } catch (error) {
        // Si falla por falta de índice, usar método alternativo
        if (error.message && error.message.includes('index')) {
          console.warn('⚠️ Índice no encontrado para categorías, usando método alternativo. Crea el índice para mejor rendimiento.');
          if (error.message.includes('create_composite')) {
            const indexUrl = error.message.match(/https:\/\/[^\s]+/)?.[0];
            if (indexUrl) {
              console.warn(`📋 Crea el índice aquí: ${indexUrl}`);
            }
          }
          useOptimizedQuery = false;
          
          // Obtener todas las categorías sin filtros complejos
          query = db.collection(this.COLLECTION);
          snapshot = await query.get();
        } else {
          throw error;
        }
      }

      // Convertir a objetos
      let allCategories = snapshot.docs.map(doc => this.docToObject(doc));

      // Aplicar filtros en memoria si no se usó consulta optimizada
      if (!useOptimizedQuery) {
        // Filtro de activo
        if (!includeInactive) {
          allCategories = allCategories.filter(c => c.isActive === true);
        }

        // Filtro de categoría padre
        if (filters.parentId !== undefined) {
          if (filters.parentId === null) {
            allCategories = allCategories.filter(c => c.parentId === null || c.parentId === undefined);
          } else {
            allCategories = allCategories.filter(c => c.parentId === filters.parentId);
          }
        }

        // Ordenamiento en memoria
        allCategories.sort((a, b) => {
          const aName = (a.name || '').toLowerCase();
          const bName = (b.name || '').toLowerCase();
          return aName.localeCompare(bName);
        });
      }

      // Si se solicita con subcategorías, cargarlas
      if (filters.includeSubcategories) {
        for (const category of allCategories) {
          const subcategories = await this.findAll({ parentId: category.id }, includeInactive);
          category.subcategories = subcategories.data || [];
        }
      }

      return {
        success: true,
        data: allCategories
      };
    } catch (error) {
      throw new Error(`Error al obtener categorías: ${error.message}`);
    }
  }

  /**
   * Actualizar categoría
   */
  static async update(id, updateData) {
    try {
      const docRef = db.collection(this.COLLECTION).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new Error('Categoría no encontrada');
      }

      // Actualizar slug si cambió el nombre
      if (updateData.name && !updateData.slug) {
        updateData.slug = await this.generateSlug(updateData.name);
        
        // Verificar que el nuevo slug sea único
        const existing = await this.findBySlug(updateData.slug);
        if (existing && existing.id !== id) {
          throw new Error('El slug ya está en uso');
        }
      }

      updateData.updatedAt = new Date();

      await docRef.update(updateData);
      const updatedDoc = await docRef.get();

      return {
        success: true,
        data: this.docToObject(updatedDoc)
      };
    } catch (error) {
      throw new Error(`Error al actualizar categoría: ${error.message}`);
    }
  }

  /**
   * Eliminar categoría (soft delete)
   */
  static async delete(id) {
    try {
      return await this.update(id, { isActive: false });
    } catch (error) {
      throw new Error(`Error al eliminar categoría: ${error.message}`);
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
      baseSlug = 'categoria';
    }

    let slug = baseSlug;
    let counter = 0;

    while (counter < 100) {
      const existing = await this.findBySlug(slug);
      if (!existing) {
        return slug;
      }

      counter++;
      slug = `${baseSlug}-${counter}`;
    }

    const timestamp = Date.now().toString().slice(-6);
    return `${baseSlug}-${timestamp}`;
  }
}

module.exports = CategoryService;

