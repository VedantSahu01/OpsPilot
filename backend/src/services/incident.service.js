import incidentRepository from '../repositories/incident.repository.js';
import ApiError from '../utils/ApiError.js';
import { getPaginationData } from '../utils/pagination.js';

class IncidentService {
  async createIncident(data) {
    const incident = await incidentRepository.create(data);
    return { id: incident._id };
  }

  async getIncidentById(id) {
    const incident = await incidentRepository.findById(id);
    if (!incident) {
      throw new ApiError(404, 'Incident not found');
    }
    return this._mapIncident(incident);
  }

  async getAllIncidents(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [incidents, totalRecords] = await Promise.all([
      incidentRepository.findAll(skip, limit),
      incidentRepository.countAll()
    ]);

    const mappedIncidents = incidents.map((inc) => this._mapIncident(inc));
    const pagination = getPaginationData(totalRecords, page, limit);

    return {
      incidents: mappedIncidents,
      pagination
    };
  }

  async getExportIncidents() {
    const incidents = await incidentRepository.findAllWithoutPagination();
    return incidents.map((inc) => this._mapIncident(inc));
  }

  async resolveIncident(id) {
    const incident = await incidentRepository.resolve(id);
    if (!incident) {
      throw new ApiError(404, 'Incident not found');
    }
    return null;
  }

  _mapIncident(incident) {
    if (!incident) return null;
    const { _id, ...rest } = incident;
    return {
      id: _id,
      ...rest
    };
  }
}

export default new IncidentService();
