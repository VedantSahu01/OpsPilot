import axios from 'axios';

// Base URL points to Node.js backend. Can be overridden in production using environment variables.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const incidentsApi = {
  /**
   * Fetch paginated list of incidents.
   * By default, requests first page with a high limit to get all recent records.
   */
  async getIncidents(page = 1, limit = 50) {
    const response = await apiClient.get('/api/v1/incidents', {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Fetch detailed information of a single incident.
   */
  async getIncident(id) {
    const response = await apiClient.get(`/api/v1/incidents/${id}`);
    return response.data;
  },

  /**
   * Download the entire database log file.
   */
  async exportIncidents() {
    const response = await apiClient.get('/api/v1/incidents/export');
    return response.data;
  },
};
