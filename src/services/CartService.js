import CartsRepository from '../dao/repositories/CartRepository.js';
import CartsDAO from '../dao/CartsDAO.js';
import CartModel from '../dao/models/cartsModel.js';

const cartsRepository = new CartsRepository(() => new CartsDAO(CartModel));

export default class CartsService {
  async getAll(filter = {}) {
    return await cartsRepository.getCarts(filter);
  }

  async getById(cid) {
    const cart = await cartsRepository.getById(cid);
    if (!cart) throw new Error('Carrito no encontrado');
    return cart;
  }

  async create(data) {
    return await cartsRepository.createCart(data);
  }

  async update(cartId, productId, quantity) {
    const result = await cartsRepository.updateCart(
      cartId,
      productId,
      quantity
    );
    if (!result) throw new Error('Carrito no encontrado');
    return result;
  }

  async delete(cid) {
    const deletedCart = await cartsRepository.deleteCartById(cid);
    if (!deletedCart) throw new Error('Carrito no encontrado');
    return deletedCart;
  }

  async deleteProductFromCart(cid, pid) {
    const updatedCart = await cartsRepository.deleteProductFromCart(cid, pid);
    if (!updatedCart) throw new Error('Carrito o producto no encontrado');
    return updatedCart;
  }
}

export const cartsService = new CartsService();
