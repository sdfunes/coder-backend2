const express = require('express');
const router = express.Router();
const CartManager = require('../managers/CartManager');
const manager = new CartManager();

router.post('/', async (req, res) => {
  const cart = await manager.createCart();
  res.status(201).json(cart);
});

router.get('/:cid', async (req, res) => {
  const cart = await manager.getById(req.params.cid);
  if (!cart) return res.status(404).send('Carrito no encontrado');
  res.json(cart.products);
});

router.post('/:cid/product/:pid', async (req, res) => {
  const cart = await manager.addProductToCart(
    parseInt(req.params.cid),
    req.params.pid
  );
  if (!cart) return res.status(404).send('Carrito no encontrado');
  res.json(cart);
});

module.exports = router;
