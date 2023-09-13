const j2s = require('joi-to-swagger');
const {
  authorGetQuerySchema,
} = require('./schemas');

const { swagger: swaggerAuthorGetQuerySchema } = j2s(authorGetQuerySchema);

const authorSwagger = {
  '/author': {
    get: {
      tags: ['author'],
      summary: 'Returns a list of all authors that an admin panel operator is allowed to message',
      parameters: [
        {
          schema: {
            ...swaggerAuthorGetQuerySchema,
          },
          in: 'query',
          required: true,
          name: 'query',
          description: 'Author\'s id',
        },
      ],
      responses: {
        200: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    format: 'string',
                  },
                  handle: {
                    type: 'string',
                    format: 'email',
                  }
                },
              },
            },
          },
        },
      },
    },
  },
};

const authorComponent = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'string' },
    handle: { type: 'string', format: 'email' },
  },
};

module.exports = {
  authorSwagger,
  authorComponent,
};