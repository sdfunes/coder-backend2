export default class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(payload) {
    return this.model.create(payload);
  }

  async findById(id, options = {}) {
    return this.model.findById(id, options.populate || null);
  }

  async findOne(filter, options = {}) {
    return this.model.findOne(filter);
  }

  async updateById(id, payload, opts = {}) {
    return this.model.findByIdAndUpdate(id, payload, { new: true, ...opts });
  }

  async deleteById(id) {
    return this.model.findByIdAndDelete(id);
  }

  async find(filter = {}, proj = null, opts = {}) {
    return this.model.find(filter, proj, opts);
  }

  async paginate(filter = {}, options = {}) {
    if (typeof this.model.paginate === 'function') {
      return this.model.paginate(filter, options);
    }
    const limit = options.limit || 10;
    const page = options.page || 1;
    const docs = await this.model
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    const totalDocs = await this.model.countDocuments(filter);
    return {
      docs,
      totalDocs,
      totalPages: Math.ceil(totalDocs / limit),
      page,
      hasPrevPage: page > 1,
      hasNextPage: page * limit < totalDocs,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page * limit < totalDocs ? page + 1 : null,
    };
  }
}
