import { mockRFIDCards } from '../data/mockRFIDCards';
import { mockProducts } from '../data/mockProducts';
import { mockOrders } from '../data/mockOrders';
import { mockUsers } from '../data/mockUsers';
import { delay } from '../utils/formatters';

export const rfidService = {
  getAll: async () => {
    await delay(300);
    return [...mockRFIDCards];
  },

  getByCardId: async (rfidCardId) => {
    await delay(200);
    return mockRFIDCards.find(r => r.rfidCardId === rfidCardId) || null;
  },

  getByUser: async (userId) => {
    await delay(300);
    return mockRFIDCards.filter(r => r.userId === userId);
  },

  /**
   * Look up full product + order + user info from RFID card
   * This is the main function used by the RFID reader page
   */
  lookupCard: async (rfidCardId) => {
    await delay(600);
    const card = mockRFIDCards.find(r => r.rfidCardId === rfidCardId);
    if (!card) return null;

    const product = mockProducts.find(p => p.productId === card.productId);
    const order = mockOrders.find(o => o.orderId === card.orderId);
    const user = mockUsers.find(u => u.userId === card.userId);

    return {
      card,
      product,
      order,
      user
    };
  },

  assignCard: async (rfidCardId, userId, productId, orderId) => {
    await delay(500);
    const newCard = {
      rfidCardId,
      userId,
      productId,
      orderId,
      isActive: true,
      assignedAt: new Date().toISOString()
    };
    mockRFIDCards.push(newCard);
    return newCard;
  }
};
