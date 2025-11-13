import CartsService from '../services/CartService.js';

const cartsService = new CartsService();

export default class CartsController {
  async getById(cid) {
    try {
      const cart = await cartsService.getById(cid);
      return cart;
    } catch (error) {
      console.error('Error en CartsController.getById:', error);
      throw new Error('No se pudo obtener el carrito');
    }
  }

  async create(req, res) {
    try {
      const newCart = await cartsService.create({ products: [] });
      return newCart;
    } catch (error) {
      throw new Error('No se pudo crear el carrito');
    }
  }

  async update(cid, pid, quantity) {
    try {
      const updatedCart = await cartsService.update(cid, pid, quantity);
      if (!updatedCart) {
        throw new Error('No se pudo actualizar el carrito');
      }
      return updatedCart;
    } catch (error) {
      throw new Error('No se pudo actualizar el carrito');
    }
  }

  async delete(cid) {
    try {
      const deleted = await cartsService.delete(cid);
      return deleted;
    } catch (error) {
      console.error('Error en CartsController.delete:', error);
      throw new Error('No se pudo eliminar el carrito');
    }
  }

  async deleteProductFromCart(cid, pid) {
    try {
      const updatedCart = await cartsService.deleteProductFromCart(cid, pid);
      return updatedCart;
    } catch (error) {
      console.error('Error en CartsController.deleteProductFromCart:', error);
      throw error;
    }
  }
}
