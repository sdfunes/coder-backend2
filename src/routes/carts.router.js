import { Router } from 'express';
import CartManager from '../dao/managers/CartManager.js';

export const cartsRouter = Router();
const cartManager = new CartManager();

cartsRouter.post('/', async (req, res) => {
  try {
    const cart = await cartManager.createCart();
    res.status(201).json(cart);
  } catch (error) {
    console.error('Error al crear carrito:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

cartsRouter.get('/:cid', async (req, res) => {
  try {
    const cart = await cartManager.getCartById(req.params.cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

cartsRouter.post('/:cid/product/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await cartManager.addProductToCart(cid, pid);

    const io = req.app.get('socketio');
    io.emit('cartUpdated', { cartId: cid, cart });

    res.json(cart);
  } catch (error) {
    console.error('Error al agregar producto al carrito:', error);
    res.status(500).json({ error: error.message });
  }
});

cartsRouter.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await cartManager.removeProductFromCart(cid, pid);

    const io = req.app.get('socketio');
    io.emit('cartUpdated', { cid, cart });

    res.json(cart);
  } catch (error) {
    console.error('Error al eliminar producto del carrito:', error);
    res.status(500).json({ error: error.message });
  }
});

cartsRouter.put('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;

    if (!products || !Array.isArray(products)) {
      return res
        .status(400)
        .json({ error: 'Debes enviar un array de productos' });
    }

    const cart = await cartManager.updateCart(cid, products);

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

    const cart = await cartManager.updateProductQuantity(cid, pid, quantity);

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
    const cart = await cartManager.clearCart(cid);

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
