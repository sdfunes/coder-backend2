import CartsDAO from '../CartsDAO.js';
import cartModel from '../models/cartsModel.js';

const cartsDAO = new CartsDAO(cartModel);
export default class CartsRepository {
  async createCart() {
    return await cartsDAO.create();
  }

  async getById(id) {
    return await cartsDAO.getById({ _id: id });
  }

  async updateCart(id, cart, quantity) {
    return await cartsDAO.update(id, cart, quantity);
  }

  async deleteCartById(cid) {
    return await cartsDAO.deleteCartById(cid);
  }

  async deleteProductFromCart(cid, pid) {
    return await cartsDAO.deleteProductFromCart(cid, pid);
  }
}
