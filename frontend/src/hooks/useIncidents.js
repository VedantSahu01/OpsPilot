import { useQuery } from '@tanstack/react-query';
import { incidentsApi } from '../services/incidentsApi';

/**
 * Custom hook to retrieve all incidents with automatic background refresh every 30 seconds.
 */
export const useIncidents = (page = 1, limit = 50) => {
  return useQuery({
    queryKey: ['incidents', page, limit],
    queryFn: () => incidentsApi.getIncidents(page, limit),
    refetchInterval: 30000,            // 30 seconds polling interval
    refetchIntervalInBackground: true, // Keep polling when tab is inactive
    retry: 2,                          // Retry twice on failure
  });
};
