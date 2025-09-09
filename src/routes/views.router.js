const express = require('express');
const ProductManager = require('../managers/ProductManager');
const router = express.Router();
const manager = new ProductManager();

router.get('/', async (req, res) => {
  const products = await manager.getAll();
  res.render('home', { products });
});

router.get('/realtimeproducts', async (req, res) => {
  const products = await manager.getAll();
  res.render('realTimeProducts', { products });
});

module.exports = router;
