import { useQuery } from '@tanstack/react-query';
import { incidentsApi } from '../services/incidentsApi';

/**
 * Custom hook to retrieve a specific incident's details by ID.
 */
export const useIncident = (id) => {
  return useQuery({
    queryKey: ['incident', id],
    queryFn: () => incidentsApi.getIncident(id),
    enabled: !!id, // Only run query if id is truthy
    retry: 1,      // Limit retries for individual page lookup
  });
};
