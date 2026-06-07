import Incident from '../models/incident.model.js';

class IncidentRepository {
  async create(data) {
    return await Incident.create(data);
  }

  async findById(id) {
    return await Incident.findById(id).lean();
  }

  async findAll(skip = 0, limit = 20) {
    return await Incident.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async countAll() {
    return await Incident.countDocuments();
  }
}

export default new IncidentRepository();
