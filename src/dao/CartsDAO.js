export default class CartsDAO {
  constructor(model) {
    this.model = model;
  }

  async create() {
    const cart = new this.model({ products: [] });
    return await cart.save();
  }

  async get(filter = {}) {
    return await this.model.find(filter).populate('products.product').lean();
  }

  async getById(cid) {
    return await this.model.findById(cid).populate('products.product');
  }

  async save(data) {
    return await this.model.create(data);
  }

  async update(cid, pid, quantity) {
    const cart = await this.model.findById(cid);
    if (!cart) return null;

    const existingProduct = cart.products.find(
      (p) => p.product.toString() === pid
    );

    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      cart.products.push({ product: pid, quantity });
    }

    await cart.save();
    return cart;
  }

  async deleteProductFromCart(cid, pid) {
    const cart = await this.model.findById(cid);
    if (!cart) return null;

    cart.products = cart.products.filter((p) => p.product.toString() !== pid);

    await cart.save();
    return cart;
  }

  async deleteCartById(cid) {
    return await this.model.findByIdAndDelete(cid);
  }
}
