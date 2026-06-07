import express from 'express';
import {
  createIncident,
  getAllIncidents,
  getIncidentById
} from '../controllers/incident.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { payloadNormalizationMiddleware } from '../middleware/payloadNormalization.middleware.js';
import {
  createIncidentValidator,
  getAllIncidentsValidator,
  getIncidentByIdValidator
} from '../validators/incident.validator.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/incidents:
 *   post:
 *     summary: Create an incident report
 *     description: Store a new AI-generated incident report with optional Prometheus, Kibana, or GitHub source details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IncidentInput'
 *     responses:
 *       201:
 *         description: Incident created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseSuccess'
 *       400:
 *         description: Validation failed or invalid request body.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *
 *   get:
 *     summary: Get all incidents
 *     description: Retrieve list of incidents in reverse chronological order with pagination metadata.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number of results.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of records to return.
 *     responses:
 *       200:
 *         description: A paginated list of incidents.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseGetAll'
 *       400:
 *         description: Invalid query parameters.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *
 * /api/v1/incidents/{id}:
 *   get:
 *     summary: Get incident by ID
 *     description: Fetch details of a single incident.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique MongoDB ObjectId of the incident.
 *     responses:
 *       200:
 *         description: The details of the incident.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseGetOne'
 *       400:
 *         description: Invalid MongoDB ID format.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: Incident not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
router.post('/', payloadNormalizationMiddleware, validate(createIncidentValidator), createIncident);
router.get('/', validate(getAllIncidentsValidator), getAllIncidents);
router.get('/:id', validate(getIncidentByIdValidator), getIncidentById);

export default router;
