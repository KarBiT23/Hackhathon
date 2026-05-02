import { mockOrders } from '../data/mockOrders';
import { delay, generateId } from '../utils/formatters';

export const orderService = {
  getAll: async () => {
    await delay(300);
    return [...mockOrders];
  },

  getById: async (orderId) => {
    await delay(200);
    return mockOrders.find(o => o.orderId === orderId) || null;
  },

  getByUser: async (userId) => {
    await delay(300);
    return mockOrders.filter(o => o.userId === userId);
  },

  getBySeller: async (sellerId) => {
    await delay(300);
    return mockOrders.filter(o => o.sellerId === sellerId);
  },

  create: async (orderData) => {
    await delay(500);
    const newOrder = {
      ...orderData,
      orderId: generateId('order-'),
      createdAt: new Date().toISOString(),
      orderDate: new Date().toISOString().split('T')[0],
      orderTime: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    };
    mockOrders.push(newOrder);
    return newOrder;
  },

  updateStatus: async (orderId, paymentStatus) => {
    await delay(400);
    const index = mockOrders.findIndex(o => o.orderId === orderId);
    if (index !== -1) {
      mockOrders[index].paymentStatus = paymentStatus;
      return mockOrders[index];
    }
    return null;
  }
};
