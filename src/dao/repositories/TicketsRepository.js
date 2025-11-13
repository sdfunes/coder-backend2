import TicketModel from '../models/ticketsModel.js';

class TicketsRepository {
  async create(data) {
    return await TicketModel.create(data);
  }

  async getByCode(code) {
    return await TicketModel.findOne({ code });
  }
}

export default new TicketsRepository();
