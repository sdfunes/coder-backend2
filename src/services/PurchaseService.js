import ProductRepository from '../dao/repositories/ProductRepository.js';
import CartRepository from '../dao/repositories/CartRepository.js';
import Ticket from '../dao/models/ticket.model.js';
import mongoose from 'mongoose';
import crypto from 'crypto';

const productRepo = new ProductRepository();
const cartRepo = new CartRepository();

export default class PurchaseService {
  // intenta comprar todos los productos del carrito; si falta stock, los deja en el carrito
  async purchaseCart(cartId, purchaserId) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const cart = await cartRepo.getByIdPopulated(cartId);
      if (!cart) throw new Error('Carrito no encontrado');

      const purchased = [];
      const remaining = [];

      let totalAmount = 0;

      for (const item of cart.products) {
        const product = await productRepo.findById(item.product._id);
        if (!product) {
          remaining.push(item);
          continue;
        }

        if (product.stock >= item.quantity) {
          // decrementar stock
          product.stock -= item.quantity;
          await product.save({ session });

          purchased.push({
            product: product._id,
            quantity: item.quantity,
            price: product.price,
          });

          totalAmount += product.price * item.quantity;
        } else {
          // no hay stock suficiente -> queda en remaining (no comprado)
          remaining.push(item);
        }
      }

      // generar ticket solo si hay items comprados
      let ticket = null;
      if (purchased.length > 0) {
        const code = crypto.randomBytes(6).toString('hex').toUpperCase();
        ticket = await Ticket.create(
          [
            {
              code,
              amount: totalAmount,
              purchaser: purchaserId,
              products: purchased,
            },
          ],
          { session }
        );
      }

      // actualizar carrito: dejar solamente remaining
      cart.products = remaining.map((r) => ({
        product: r.product._id,
        quantity: r.quantity,
      }));
      await cart.save({ session });

      await session.commitTransaction();
      session.endSession();

      return { ticket: ticket ? ticket[0] : null, remaining };
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }
}
