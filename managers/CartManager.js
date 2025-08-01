const fs = require('fs').promises;
const path = './data/carts.json';

class CartManager {
  async getAll() {
    const data = await fs.readFile(path, 'utf8');
    return JSON.parse(data);
  }

  async getById(id) {
    const carts = await this.getAll();
    return carts.find((c) => c.id == id);
  }

  async createCart() {
    const carts = await this.getAll();
    const newCart = { id: Date.now(), products: [] };
    carts.push(newCart);
    await fs.writeFile(path, JSON.stringify(carts, null, 2));
    return newCart;
  }

  async addProductToCart(cid, pid) {
    const carts = await this.getAll();
    const cart = carts.find((c) => c.id == cid);
    if (!cart) return null;
    const productIndex = cart.products.findIndex((p) => p.product === pid);
    if (productIndex !== -1) {
      cart.products[productIndex].quantity++;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }
    await fs.writeFile(path, JSON.stringify(carts, null, 2));
    return cart;
  }
}

module.exports = CartManager;
