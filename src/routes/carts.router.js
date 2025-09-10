import { Router } from 'express';
import { Cart } from '../models/Cart.js';

export const cartsRouter = Router();

// Crear carrito
cartsRouter.post('/', async (req, res) => {
  const cart = new Cart({ products: [] });
  await cart.save();
  res.status(201).json(cart);
});

// Obtener carrito con populate
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

// Agregar producto
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
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE producto del carrito
cartsRouter.delete('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  const cart = await Cart.findById(cid);
  cart.products = cart.products.filter((p) => p.product.toString() !== pid);
  await cart.save();
  res.json(cart);
});

// PUT carrito entero
cartsRouter.put('/:cid', async (req, res) => {
  const { cid } = req.params;
  const { products } = req.body;
  const cart = await Cart.findByIdAndUpdate(cid, { products }, { new: true });
  res.json(cart);
});

// PUT cantidad de un producto
cartsRouter.put('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;
  const cart = await Cart.findById(cid);
  const item = cart.products.find((p) => p.product.toString() === pid);
  if (item) item.quantity = quantity;
  await cart.save();
  res.json(cart);
});

// DELETE todos los productos
cartsRouter.delete('/:cid', async (req, res) => {
  const cart = await Cart.findByIdAndUpdate(
    req.params.cid,
    { products: [] },
    { new: true }
  );
  res.json(cart);
});
