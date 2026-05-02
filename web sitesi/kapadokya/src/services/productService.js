import { mockProducts } from '../data/mockProducts';
import { delay } from '../utils/formatters';

// Firebase-ready: Replace mock implementations with Firestore calls
export const productService = {
  getAll: async () => {
    await delay(300);
    return [...mockProducts];
  },

  getById: async (productId) => {
    await delay(200);
    return mockProducts.find(p => p.productId === productId) || null;
  },

  create: async (productData) => {
    await delay(500);
    // In Firebase: addDoc(collection(db, 'products'), productData)
    const newProduct = {
      ...productData,
      productId: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockProducts.push(newProduct);
    return newProduct;
  },

  update: async (productId, data) => {
    await delay(400);
    // In Firebase: updateDoc(doc(db, 'products', productId), data)
    const index = mockProducts.findIndex(p => p.productId === productId);
    if (index !== -1) {
      mockProducts[index] = { ...mockProducts[index], ...data, updatedAt: new Date().toISOString() };
      return mockProducts[index];
    }
    return null;
  },

  delete: async (productId) => {
    await delay(300);
    // In Firebase: deleteDoc(doc(db, 'products', productId))
    const index = mockProducts.findIndex(p => p.productId === productId);
    if (index !== -1) {
      mockProducts.splice(index, 1);
      return true;
    }
    return false;
  },

  getByCategory: async (category) => {
    await delay(300);
    return mockProducts.filter(p => p.category === category);
  },

  getBySeller: async (sellerId) => {
    await delay(300);
    return mockProducts.filter(p => p.sellerId === sellerId);
  },

  search: async (query) => {
    await delay(300);
    const q = query.toLowerCase();
    return mockProducts.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }
};
