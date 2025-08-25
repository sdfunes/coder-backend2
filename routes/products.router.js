const express = require('express');
const router = express.Router();
const ProductManager = require('../managers/ProductManager');
const manager = new ProductManager();

function validarProductBody(body) {
  const {
    title,
    description,
    code,
    price,
    status,
    stock,
    category,
    thumbnails,
  } = body;

  if (!title || typeof title !== 'string')
    return "El campo 'title' es obligatorio y debe ser string";
  if (!description || typeof description !== 'string')
    return "El campo 'description' es obligatorio y debe ser string";
  if (!code || typeof code !== 'string')
    return "El campo 'code' es obligatorio y debe ser string";
  if (typeof price !== 'number' || price < 0)
    return "El campo 'price' debe ser un número >= 0";
  if (typeof status !== 'boolean') return "El campo 'status' debe ser boolean";
  if (typeof stock !== 'number' || stock < 0)
    return "El campo 'stock' debe ser un número >= 0";
  if (!category || typeof category !== 'string')
    return "El campo 'category' es obligatorio y debe ser string";
  if (!Array.isArray(thumbnails))
    return "El campo 'thumbnails' debe ser un array de strings";

  return null;
}

router.get('/', async (req, res) => {
  try {
    const products = await manager.getAll();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

router.get('/:pid', async (req, res) => {
  try {
    const product = await manager.getById(req.params.pid);
    if (!product) return res.status(404).send('Producto no encontrado');
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

router.post('/', async (req, res) => {
  try {
    const error = validarProductBody(req.body);
    if (error) return res.status(400).json({ error });

    const product = await manager.addProduct(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

router.put('/:pid', async (req, res) => {
  try {
    const allowedFields = [
      'title',
      'description',
      'code',
      'price',
      'status',
      'stock',
      'category',
      'thumbnails',
    ];
    const invalidFields = Object.keys(req.body).filter(
      (f) => !allowedFields.includes(f)
    );
    if (invalidFields.length > 0) {
      return res
        .status(400)
        .json({ error: `Campos no permitidos: ${invalidFields.join(', ')}` });
    }

    const updated = await manager.updateProduct(req.params.pid, req.body);
    if (!updated) return res.status(404).send('Producto no encontrado');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

router.delete('/:pid', async (req, res) => {
  try {
    const deleted = await manager.deleteProduct(req.params.pid);
    if (!deleted) return res.status(404).send('Producto no encontrado');
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

module.exports = router;
