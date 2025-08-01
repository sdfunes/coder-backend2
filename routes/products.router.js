const express = require('express');
const router = express.Router();
const ProductManager = require('../managers/ProductManager');
const manager = new ProductManager();

router.get('/', async (req, res) => {
  const products = await manager.getAll();
  res.json(products);
});

router.get('/:pid', async (req, res) => {
  const product = await manager.getById(req.params.pid);
  if (!product) return res.status(404).send('Producto no encontrado');
  res.json(product);
});

router.post('/', async (req, res) => {
  const {
    title,
    description,
    code,
    price,
    status,
    stock,
    category,
    thumbnails,
  } = req.body;
  const product = await manager.addProduct({
    title,
    description,
    code,
    price,
    status,
    stock,
    category,
    thumbnails,
  });
  res.status(201).json(product);
});

router.put('/:pid', async (req, res) => {
  const updated = await manager.updateProduct(req.params.pid, req.body);
  if (!updated) return res.status(404).send('Producto no encontrado');
  res.json(updated);
});

router.delete('/:pid', async (req, res) => {
  const deleted = await manager.deleteProduct(req.params.pid);
  if (!deleted) return res.status(404).send('Producto no encontrado');
  res.sendStatus(204);
});

module.exports = router;
