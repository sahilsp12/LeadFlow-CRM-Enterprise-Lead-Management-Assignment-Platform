const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Mini Lead Management System API',
    version: '1.0.0',
    description: 'Production-ready REST API documentation for the Mini Lead Management System. Features role-based authorization, concurrency-safe least-loaded agent assignment, and audit logs.',
    contact: {
      name: 'System Admin',
      email: 'admin@waanee.ai'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development Server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT access token. Obtained from /api/auth/login.'
      }
    },
    schemas: {
      StandardResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object' }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Operation failed' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' }
              }
            }
          }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'AGENT'] },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Lead: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          source: { type: 'string' },
          status: { type: 'string', enum: ['New', 'Contacted', 'Qualified', 'Lost', 'Closed'] },
          assignedTo: { type: 'string', format: 'uuid', nullable: true },
          notes: { type: 'string' },
          createdBy: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      ActivityLog: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          action: { type: 'string' },
          leadId: { type: 'string', format: 'uuid', nullable: true },
          userId: { type: 'string', format: 'uuid', nullable: true },
          description: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user profile',
        security: [], // Public
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Jane Agent' },
                  email: { type: 'string', format: 'email', example: 'jane@waanee.ai' },
                  password: { type: 'string', example: 'password123' },
                  role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'AGENT'], default: 'AGENT' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Successfully registered',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } }
          },
          400: { description: 'Validation or client-side error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Authenticate credentials and return JWT tokens',
        security: [], // Public
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'admin@waanee.ai' },
                  password: { type: 'string', example: 'admin123' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Login successful. Sets HttpOnly refreshToken cookie.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } }
          },
          401: { description: 'Unauthorized credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    },
    '/api/auth/refresh': {
      post: {
        tags: ['Authentication'],
        summary: 'Rotate refresh token and issue new access token',
        security: [],
        requestBody: {
          optional: true,
          content: {
            'application/json': {
              schema: {
                properties: {
                  refreshToken: { type: 'string', description: 'Fallback if cookie is not sent' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Rotation successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } } },
          401: { description: 'Invalid or expired refresh token' }
        }
      }
    },
    '/api/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Revoke refresh tokens and clear cookies',
        security: [],
        responses: {
          200: { description: 'Successfully logged out' }
        }
      }
    },
    '/api/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Retrieve authenticated profile',
        responses: {
          200: { description: 'Success', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } } }
        }
      }
    },
    '/api/leads': {
      get: {
        tags: ['Leads'],
        summary: 'Query and list leads with pagination/sorting/filtering',
        description: 'Agents only see assigned leads. Admins and Managers query everything.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Query name, email, phone' },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['New', 'Contacted', 'Qualified', 'Lost', 'Closed'] } },
          { name: 'source', in: 'query', schema: { type: 'string' } },
          { name: 'sortBy', in: 'query', schema: { type: 'string', default: 'createdAt' } },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['ASC', 'DESC'], default: 'DESC' } }
        ],
        responses: {
          200: { description: 'Retrieved successfully' }
        }
      },
      post: {
        tags: ['Leads'],
        summary: 'Create a new lead (Admin & Manager only)',
        description: 'If assignedTo is omitted, triggers concurrency-safe auto-assignment to the least-loaded agent.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Lead Target' },
                  email: { type: 'string', format: 'email', example: 'lead@target.com' },
                  phone: { type: 'string', example: '555-0199' },
                  source: { type: 'string', example: 'Google Ads' },
                  status: { type: 'string', enum: ['New', 'Contacted', 'Qualified', 'Lost', 'Closed'], default: 'New' },
                  assignedTo: { type: 'string', format: 'uuid', nullable: true },
                  notes: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Created successfully' }
        }
      }
    },
    '/api/leads/suggest': {
      get: {
        tags: ['Leads'],
        summary: 'Fetch random profile suggestion from RandomUser API',
        responses: {
          200: { description: 'Enrichment recommendation retrieved' }
        }
      }
    },
    '/api/leads/{id}': {
      get: {
        tags: ['Leads'],
        summary: 'Find single lead by UUID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'Lead details' },
          404: { description: 'Not found' }
        }
      },
      put: {
        tags: ['Leads'],
        summary: 'Update lead information',
        description: 'Admins and Managers can edit anything. Agents can only edit status and notes.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  phone: { type: 'string' },
                  source: { type: 'string' },
                  status: { type: 'string', enum: ['New', 'Contacted', 'Qualified', 'Lost', 'Closed'] },
                  assignedTo: { type: 'string', format: 'uuid', nullable: true },
                  notes: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Updated successfully' }
        }
      },
      delete: {
        tags: ['Leads'],
        summary: 'Soft-delete lead by UUID (Admin & Manager only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'Soft-deleted successfully' }
        }
      }
    },
    '/api/dashboard/stats': {
      get: {
        tags: ['Dashboard'],
        summary: 'Retrieve dashboard metrics breakdown',
        responses: {
          200: { description: 'Aggregated analytics payload' }
        }
      }
    },
    '/api/logs': {
      get: {
        tags: ['Audit Trails'],
        summary: 'Query system-wide activity logs (Admin only)',
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } }
        ],
        responses: {
          200: { description: 'Audits retrieved' }
        }
      }
    },
    '/api/logs/lead/{leadId}': {
      get: {
        tags: ['Audit Trails'],
        summary: 'Fetch activity event history logs for a specific lead',
        parameters: [{ name: 'leadId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'Event list' }
        }
      }
    }
  }
};

const swaggerOptions = {
  swaggerDefinition,
  apis: [] // Explicit specification mappings declared in definition for stability
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = {
  swaggerUi,
  swaggerSpec
};
