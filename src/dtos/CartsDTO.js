export class CartDTO {
  constructor(cart) {
    this.id = cart._id;
    this.products = cart.products.map((p) => ({
      productId: p.product?._id || p.product,
      title: p.product?.title,
      price: p.product?.price,
      quantity: p.quantity,
    }));
  }
}
