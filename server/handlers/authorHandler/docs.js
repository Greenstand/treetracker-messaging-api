const j2s = require('joi-to-swagger');
const {
  authorGetQuerySchema,
} = require('./schemas');

const { swagger: swaggerAuthorGetQuerySchema } = j2s(authorGetQuerySchema);

const authorCaptureResponse = {
  content: {
    'application/json': {
      schema: {
        $ref: '#/components/schemas/Author',
      },
    },
  },
};

const authorSwagger = {
  '/author': {
    get: {
      tags: ['Author'],
      summary: 'Returns a list of all authors that an admin panel operator is allowed to message',
      parameters: [
        {
          schema: {
            ...swaggerAuthorGetQuerySchema,
          },
          in: 'query',
          required: true,
          name: 'query',
          description: 'Author ID',
        },
      ],
      responses: {
        200: authorCaptureResponse,
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