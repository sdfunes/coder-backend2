import { Router } from 'express';
import CartsController from '../controllers/cartsController.js';
import purchaseController from '../controllers/purchaseController.js';
import { ensureOwnsCartOrAdmin } from '../middleware/auth.js';
import passport from 'passport';

export const cartsRouter = Router();
const cartsController = new CartsController();

cartsRouter.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const cart = cartsController.create();
    res.status(201).json(cart);
  }
);

cartsRouter.get(
  '/:cid',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const cart = cartsController.getById(req.params.cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.json(cart);
  }
);

cartsRouter.post(
  '/:cid/product/:pid',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { cid, pid } = req.params;
      const quantity = req.body?.quantity ?? 1;
      const cart = await cartsController.update(cid, pid, quantity);
      res.status(200).json({ status: 'success', cart });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }
);

cartsRouter.delete(
  '/:cid/products/:pid',
  passport.authenticate('jwt', { session: false }),
  ensureOwnsCartOrAdmin(),
  (req, res) => {
    const { cid, pid } = req.params;
    const cart = cartsController.deleteProductFromCart(cid, pid);

    const io = req.app.get('socketio');
    io.emit('cartUpdated', { cid, cart });

    res.json(cart);
  }
);

cartsRouter.put(
  '/:cid',
  passport.authenticate('jwt', { session: false }),
  ensureOwnsCartOrAdmin(),
  (req, res) => {
    const { cid } = req.params;
    const { products } = req.body;

    if (!products || !Array.isArray(products)) {
      return res
        .status(400)
        .json({ error: 'Debes enviar un array de productos' });
    }

    const cart = cartsController.update(cid, products, 1);

    const io = req.app.get('socketio');
    io.emit('cartUpdated', { cid, cart });

    res.json(cart);
  }
);

cartsRouter.put(
  '/:cid/products/:pid',
  passport.authenticate('jwt', { session: false }),
  ensureOwnsCartOrAdmin(),
  (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({ error: 'Debes enviar la quantity' });
    }

    const cart = cartsController.update(req, res);

    const io = req.app.get('socketio');
    io.emit('cartUpdated', { cid, cart });

    res.json({ status: 'success', payload: cart });
  }
);

cartsRouter.delete(
  '/:cid',
  passport.authenticate('jwt', { session: false }),
  ensureOwnsCartOrAdmin(),
  (req, res) => {
    const { cid } = req.params;
    const cart = cartsController.delete(cid);

    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    const io = req.app.get('socketio');
    io.emit('cartDeleted', { cid, cart });

    res.json({ status: 'success', payload: cart });
  }
);

cartsRouter.post(
  '/:cid/purchase',
  passport.authenticate('jwt', { session: false }),
  ensureOwnsCartOrAdmin(),
  async (req, res) => {
    try {
      const { cid } = req.params;
      const user = req.user;

      const result = await purchaseController.processPurchase(cid, user._id);

      res.status(200).json({
        status: 'success',
        ticket: result.ticket,
        cart: result.updatedCart,
      });
    } catch (error) {
      console.error('Error en purchase:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Error al procesar la compra',
      });
    }
  }
);

export default cartsRouter;
