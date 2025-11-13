export default class ProductsDAO {
  constructor(model) {
    this.model = model;
  }

  async get(filter = {}, options = {}) {
    return (await this.model.paginate)
      ? await this.model.paginate(filter, options)
      : await this.model.find(filter);
  }

  async getById(id) {
    return await this.model.findById(id);
  }

  async save(data) {
    return await this.model.create(data);
  }

  async update(id, data) {
    return await this.model.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await this.model.findByIdAndDelete(id);
  }
}
