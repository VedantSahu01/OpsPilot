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

export const exportIncidents = (req, res, next) => {
  incidentService
    .getExportIncidents()
    .then((data) => {
      res.setHeader('Content-Disposition', 'attachment; filename="opspilot-incidents.json"');
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(data);
    })
    .catch(next);
};

export const resolveIncident = (req, res, next) => {
  const { id } = req.params;
  incidentService
    .resolveIncident(id)
    .then(() => ApiResponse.send(res, 200, undefined, 'Incident marked as resolved'))
    .catch(next);
};
