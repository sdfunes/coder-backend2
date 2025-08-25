const express = require('express');
const ProductManager = require('../managers/ProductManager');

module.exports = function (io) {
  const router = express.Router();
  const manager = new ProductManager();

  router.get('/', async (req, res) => {
    try {
      const products = await manager.getAll();
      res.json(products);
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener productos' });
    }
  });

  router.post('/', async (req, res) => {
    try {
      const product = await manager.addProduct(req.body);
      io.emit('productAdded', product);
      res.status(201).json(product);
    } catch (err) {
      res.status(500).json({ error: 'Error al crear producto' });
    }
  });

  router.delete('/:pid', async (req, res) => {
    try {
      const deleted = await manager.deleteProduct(req.params.pid);
      if (!deleted) return res.status(404).send('Producto no encontrado');

      io.emit('productDeleted', req.params.pid);
      res.sendStatus(204);
    } catch (err) {
      res.status(500).json({ error: 'Error al eliminar producto' });
    }
  });

  return router;
};
