const express = require('express');
const router = express.Router();
const CartManager = require('../managers/CartManager');
const manager = new CartManager();

router.post('/', async (req, res) => {
  try {
    const cart = await manager.createCart();
    res.status(201).json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear carrito' });
  }
});

router.get('/:cid', async (req, res) => {
  try {
    const cart = await manager.getById(req.params.cid);
    if (!cart) return res.status(404).send('Carrito no encontrado');
    res.json(cart.products);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener carrito' });
  }
});

router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;

    if (!cid || isNaN(cid)) {
      return res
        .status(400)
        .json({ error: "El 'cid' debe ser un número válido" });
    }
    if (!pid) {
      return res.status(400).json({ error: "El 'pid' es obligatorio" });
    }

    const cart = await manager.addProductToCart(parseInt(cid), pid);
    if (!cart) return res.status(404).send('Carrito no encontrado');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Error al agregar producto al carrito' });
  }
});

module.exports = router;
