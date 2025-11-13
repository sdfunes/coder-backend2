import ProductRepository from '../dao/repositories/ProductRepository.js';
import CartRepository from '../dao/repositories/CartRepository.js';
import Ticket from '../dao/models/ticketsModel.js';
import mongoose from 'mongoose';
import crypto from 'crypto';

const productRepo = new ProductRepository();
const cartRepo = new CartRepository();

class PurchaseService {
  async purchaseCart(cartId, purchaserId) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const cart = await cartRepo.getById(cartId);
      if (!cart) throw new Error('Carrito no encontrado');

      const purchased = [];
      const remaining = [];
      let totalAmount = 0;

      for (const item of cart.products) {
        const product = await productRepo.getProductById(item.product._id);
        if (!product) {
          remaining.push(item);
          continue;
        }

        if (product.stock >= item.quantity) {
          product.stock -= item.quantity;
          await product.save({ session });

          purchased.push({
            product: product._id,
            quantity: item.quantity,
            price: product.price,
          });

          totalAmount += product.price * item.quantity;
        } else {
          remaining.push(item);
        }
      }

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

      cart.products = remaining.map((r) => ({
        product: r.product._id,
        quantity: r.quantity,
      }));
      await cart.save({ session });

      await session.commitTransaction();
      session.endSession();
      return {
        ticket: ticket
          ? ticket[0]
          : 'Ocurrió un error en la compra por falta de stock.',
        remaining,
      };
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }
}

export default new PurchaseService();
