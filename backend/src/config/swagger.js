import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Incident Management API',
      version: '1.0.0',
      description: 'Production-ready Incident Management API'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development Server'
      }
    ],
    components: {
      schemas: {
        Source: {
          type: 'object',
          required: ['name', 'description'],
          properties: {
            name: {
              type: 'string',
              enum: ['PROMETHEUS', 'KIBANA', 'GITHUB', 'ARGO'],
              example: 'PROMETHEUS'
            },
            description: {
              type: 'string',
              example: 'Prometheus metrics showing increase in HTTP 500 errors.'
            },
            data: {
              type: 'object',
              additionalProperties: true,
              example: {
                alertname: 'Http5xxRateHigh',
                severity: 'critical'
              }
            }
          }
        },
        IncidentInput: {
          type: 'object',
          required: ['heading', 'summary'],
          properties: {
            heading: {
              type: 'string',
              minLength: 10,
              maxLength: 500,
              example: 'Checkout Service 500 Errors due to Redis Connection Pool Exhaustion'
            },
            summary: {
              type: 'string',
              minLength: 20,
              example: 'A spike in 500 errors on checkout-service was observed due to connection exhaustion in jedis.'
            },
            sources: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Source'
              },
              example: [
                {
                  name: 'PROMETHEUS',
                  description: 'Prometheus metrics showing increase in HTTP 500 errors.',
                  data: {
                    value: 540,
                    threshold: 500
                  }
                }
              ]
            }
          }
        },
        IncidentResponse: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '65f37efb8401ef6c1178229b'
            },
            heading: {
              type: 'string',
              example: 'Checkout Service 500 Errors due to Redis Connection Pool Exhaustion'
            },
            summary: {
              type: 'string',
              example: 'A spike in 500 errors on checkout-service was observed due to connection exhaustion in jedis.'
            },
            sources: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Source'
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-06-07T12:00:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-06-07T12:05:00.000Z'
            }
          }
        },
        ApiResponseSuccess: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Incident created successfully'
            },
            data: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  example: '65f37efb8401ef6c1178229b'
                }
              }
            }
          }
        },
        ApiResponseGetOne: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              $ref: '#/components/schemas/IncidentResponse'
            }
          }
        },
        ApiResponseGetAll: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 20 },
                totalRecords: { type: 'integer', example: 100 },
                totalPages: { type: 'integer', example: 5 },
                hasNextPage: { type: 'boolean', example: true },
                hasPreviousPage: { type: 'boolean', example: false }
              }
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/IncidentResponse'
              }
            }
          }
        },
        ApiErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Incident not found'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'heading' },
                  message: { type: 'string', example: 'heading must be at least 10 characters' }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/app.js']
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
