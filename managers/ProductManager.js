const fs = require('fs').promises;
const path = './data/products.json';

class ProductManager {
  async getAll() {
    try {
      const data = await fs.readFile(path, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error('Error leyendo products.json', err);
      throw err;
    }
  }

  async getById(id) {
    const products = await this.getAll();
    return products.find((p) => p.id == id);
  }

  async addProduct(product) {
    const products = await this.getAll();
    const newId = Date.now();
    const newProduct = { id: newId, ...product };
    products.push(newProduct);
    await fs.writeFile(path, JSON.stringify(products, null, 2));
    return newProduct;
  }

  async updateProduct(id, updateData) {
    const products = await this.getAll();
    const index = products.findIndex((p) => p.id == id);
    if (index === -1) return null;
    updateData.id = products[index].id; // No modificar ID
    products[index] = { ...products[index], ...updateData };
    await fs.writeFile(path, JSON.stringify(products, null, 2));
    return products[index];
  }

  async deleteProduct(id) {
    let products = await this.getAll();
    const initialLength = products.length;
    products = products.filter((p) => p.id != id);
    await fs.writeFile(path, JSON.stringify(products, null, 2));
    return products.length < initialLength;
  }
}

module.exports = ProductManager;
