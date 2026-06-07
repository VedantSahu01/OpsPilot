import { z } from 'zod';
import mongoose from 'mongoose';

const objectIdSchema = z.string().refine(
  (val) => mongoose.Types.ObjectId.isValid(val),
  { message: 'Invalid MongoDB ID format' }
);

export const createIncidentValidator = z.object({
  body: z.object({
    heading: z
      .string({
        required_error: 'heading is required'
      })
      .min(10, 'heading must be at least 10 characters')
      .max(500, 'heading cannot exceed 500 characters'),
    
    summary: z
      .string({
        required_error: 'summary is required'
      })
      .min(20, 'summary must be at least 20 characters'),

    sources: z
      .array(
        z.object({
          name: z.enum(['PROMETHEUS', 'KIBANA', 'GITHUB', 'ARGO'], {
            error_map: () => ({ message: 'name must be PROMETHEUS, KIBANA, GITHUB, or ARGO' })
          }),
          description: z
            .string({
              required_error: 'description is required'
            })
            .min(1, 'description cannot be empty'),
          data: z.any().default({})
        })
      )
      .optional()
  })
});

export const getIncidentByIdValidator = z.object({
  params: z.object({
    id: objectIdSchema
  })
});

export const getAllIncidentsValidator = z.object({
  query: z.object({
    page: z.preprocess(
      (val) => {
        if (val === undefined || val === null || val === '') return 1;
        const parsed = Number(val);
        return isNaN(parsed) ? val : parsed;
      },
      z.number({ invalid_type_error: 'page must be a number' })
        .int('page must be an integer')
        .positive('page must be greater than 0')
        .default(1)
    ),
    limit: z.preprocess(
      (val) => {
        if (val === undefined || val === null || val === '') return 20;
        const parsed = Number(val);
        return isNaN(parsed) ? val : parsed;
      },
      z.number({ invalid_type_error: 'limit must be a number' })
        .int('limit must be an integer')
        .positive('limit must be greater than 0')
        .max(100, 'limit cannot exceed 100')
        .default(20)
    )
  })
});
