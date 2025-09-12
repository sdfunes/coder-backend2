import { Router } from 'express';
import { Cart } from '../dao/models/cartsModel.js';
import mongoose from 'mongoose';

export const cartsRouter = Router();

cartsRouter.post('/', async (req, res) => {
  try {
    const cart = new Cart({ products: [] });
    await cart.save();
    res.status(201).json(cart);
  } catch (error) {
    console.error('Error al crear carrito:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

cartsRouter.get('/:cid', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate(
      'products.product'
    );
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

cartsRouter.post('/:cid/product/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await Cart.findById(cid);
    const item = cart.products.find((p) => p.product.toString() === pid);

    if (item) {
      item.quantity++;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    await cart.save();

    const io = req.app.get('socketio');
    io.emit('cartUpdated', { cid, cart });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

cartsRouter.delete('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  const cart = await Cart.findById(cid);
  cart.products = cart.products.filter((p) => p.product.toString() !== pid);
  try {
    await cart.save();
  } catch (error) {
    console.error('Error al guardar el carrito:', error);
  }

  const io = req.app.get('socketio');
  io.emit('cartUpdated', { cid, cart });
  res.json(cart);
});

// carrito entero
cartsRouter.put('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    if (!req.body)
      return res.status(400).json({ error: 'Cuerpo de solicitud vacío' });

    const { products } = req.body;
    if (!products || !Array.isArray(products)) {
      return res
        .status(400)
        .json({ error: 'Debes enviar un array de productos' });
    }
    const productsToUpdate = req.body.products.map((p) => ({
      product: new mongoose.Types.ObjectId(p.product),
      quantity: p.quantity,
    }));
    const cart = await Cart.findByIdAndUpdate(
      cid,
      { products: productsToUpdate },
      { new: true, runValidators: true }
    );
    const io = req.app.get('socketio');
    io.emit('cartUpdated', { cid, cart });
    res.json(cart);
  } catch (error) {
    console.error('Error al actualizar carrito:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

cartsRouter.put('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({ error: 'Debes enviar la quantity' });
    }

    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    const item = cart.products.find((p) => p.product.toString() === pid);
    if (!item)
      return res
        .status(404)
        .json({ error: 'Producto no encontrado en el carrito' });

    item.quantity = quantity;

    cart.markModified('products');

    await cart.save();

    const io = req.app.get('socketio');
    io.emit('cartUpdated', { cid, cart });

    res.json({ status: 'success', payload: cart });
  } catch (error) {
    console.error('Error al actualizar quantity:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

cartsRouter.delete('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await Cart.findByIdAndUpdate(
      cid,
      { products: [] },
      { new: true }
    );

    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    const io = req.app.get('socketio');
    io.emit('cartUpdated', { cid, cart });

    res.json({ status: 'success', payload: cart });
  } catch (error) {
    console.error('Error al vaciar carrito:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default cartsRouter;
