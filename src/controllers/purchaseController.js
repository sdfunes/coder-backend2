import purchaseService from '../services/PurchaseService.js';

class PurchaseController {
  async processPurchase(cid, userEmail) {
    try {
      const result = await purchaseService.purchaseCart(cid, userEmail);
      return result;
    } catch (error) {
      console.error('Error en PurchaseController.processPurchase:', error);
      throw new Error('No se pudo completar la compra');
    }
  }
}

export default new PurchaseController();
