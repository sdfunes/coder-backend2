import Product from '../dao/models/product.model.js';

export default class ProductManager {
  async getProducts(filter = {}, options = {}) {
    return await Product.paginate(filter, options);
  }

  async getAllProducts(lean = false) {
    return lean ? await Product.find().lean() : await Product.find();
  }

  async getProductById(pid, lean = false) {
    return lean
      ? await Product.findById(pid).lean()
      : await Product.findById(pid);
  }

  async createProduct(data) {
    const { title, description, code, price, stock, category, thumbnails } =
      data;

    if (!title || !description || !code || !price || !stock || !category) {
      throw new Error('Faltan campos obligatorios');
    }

    if (
      typeof title !== 'string' ||
      typeof description !== 'string' ||
      typeof code !== 'string'
    ) {
      throw new Error('Título, descripción y código deben ser strings');
    }

    if (isNaN(price) || price <= 0) {
      throw new Error('Precio debe ser un número mayor a 0');
    }

    if (!Number.isInteger(stock) || stock < 0) {
      throw new Error('Stock debe ser un número entero >= 0');
    }

    const existeCodigo = await Product.findOne({ code });
    if (existeCodigo) {
      throw new Error('El código de producto ya existe');
    }

    return await Product.create({
      title,
      description,
      code,
      price,
      stock,
      category,
      status: true,
      thumbnails: thumbnails || [],
    });
  }

  async updateProduct(id, data) {
    return await Product.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteProduct(id) {
    return await Product.findByIdAndDelete(id);
  }
}
