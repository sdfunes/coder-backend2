import { Cart } from '../models/cartsModel.js';
import { Product } from '../models/productsModel.js';
import mongoose from 'mongoose';

export default class CartManager {
  async createCart() {
    const cart = new Cart({ products: [] });
    return await cart.save();
  }

  async getCartById(cid) {
    return await Cart.findById(cid).populate('products.product');
  }

  async getAnyCart() {
    return await Cart.findOne();
  }

  async addProductToCart(cid, pid) {
    const producto = await Product.findById(pid);
    if (!producto) throw new Error('Producto no encontrado');

    const cart = await Cart.findById(cid);
    if (!cart) throw new Error('Carrito no encontrado');

    const existeProducto = cart.products.find(
      (p) => p.product.toString() === pid
    );

    if (existeProducto) {
      existeProducto.quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    return await cart.save();
  }

  async removeProductFromCart(cid, pid) {
    const cart = await Cart.findById(cid);
    if (!cart) throw new Error('Carrito no encontrado');

    cart.products = cart.products.filter((p) => p.product.toString() !== pid);
    return await cart.save();
  }

  async updateCart(cid, products) {
    for (const p of products) {
      const exists = await Product.findById(p.product);
      if (!exists) {
        throw new Error(`Producto con id ${p.product} no encontrado`);
      }
    }

    const productsToUpdate = products.map((p) => ({
      product: new mongoose.Types.ObjectId(p.product),
      quantity: p.quantity,
    }));

    return await Cart.findByIdAndUpdate(
      cid,
      { products: productsToUpdate },
      { new: true, runValidators: true }
    );
  }

  async updateProductQuantity(cid, pid, quantity) {
    const cart = await Cart.findById(cid);
    if (!cart) throw new Error('Carrito no encontrado');

    const item = cart.products.find((p) => p.product.toString() === pid);
    if (!item) throw new Error('Producto no encontrado en el carrito');

    item.quantity = quantity;
    cart.markModified('products');

    return await cart.save();
  }

  async clearCart(cid) {
    return await Cart.findByIdAndUpdate(cid, { products: [] }, { new: true });
  }
}
