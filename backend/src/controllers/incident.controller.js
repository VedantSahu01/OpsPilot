import incidentService from '../services/incident.service.js';
import ApiResponse from '../utils/ApiResponse.js';

export const createIncident = (req, res, next) => {
  incidentService
    .createIncident(req.body)
    .then((data) => ApiResponse.send(res, 201, data, 'Incident created successfully'))
    .catch(next);
};

export const getIncidentById = (req, res, next) => {
  const { id } = req.params;
  incidentService
    .getIncidentById(id)
    .then((data) => ApiResponse.send(res, 200, data))
    .catch(next);
};

export const getAllIncidents = (req, res, next) => {
  const { page, limit } = req.query;
  incidentService
    .getAllIncidents(page, limit)
    .then(({ incidents, pagination }) => ApiResponse.sendPaginated(res, 200, incidents, pagination))
    .catch(next);
};
