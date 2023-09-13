const j2s = require('joi-to-swagger');
const {
  bulkMessagePostSchema,
  messagePostSchema,
  messageGetQuerySchema,
  messageSingleGetQuerySchema,
} = require('./schemas');

const { swagger: swaggerBulkMessagePostSchema } = j2s(bulkMessagePostSchema);
const { swagger: swaggerMessagePostSchema } = j2s(messagePostSchema);
const { swagger: swaggerMessageGetQuerySchema } = j2s(messageGetQuerySchema);
const { swagger: swaggerMessageSingleGetQuerySchema } = j2s(messageSingleGetQuerySchema);

const messageSwagger = {
  '/message': {
    post: {
      tags: ['message'],
      summary: 'Create a message resource',
      requestBody: {
        content: {
          'application/json': {
            schema: { ...swaggerMessagePostSchema },
          },
        },
      },
      responses: { 204: {} },
    },
    get: {
      tags: ['message'],
      summary: 'Retrieve messages for a handle since a specified date, with pagination. Includes both messages from and to the handle',
      parameters: [
        {
          schema: { type: 'string' },
          in: 'path',
          required: true,
          name: 'handle',
        },
        {
          schema: { type: 'integer' },
          in: 'path',
          name: 'offset',
        },
        {
          schema: { type: 'integer' },
          in: 'path',
          name: 'limit',
          description: 'Default value: 100',
        },
        {
          schema: { type: 'string' },
          in: 'path',
          name: 'since',
          description: 'Standard: IS0 8601',
        },
        {
          schema: { type: 'string', enum: ['composed_at'], default: 'composed_at' },
          in: 'path',
          name: 'sort_by',
        },
        {
          schema: { type: 'string', enum: ['desc', 'asc'], default: 'desc' },
          in: 'path',
          name: 'order',
        },
      ],
      responses: { 200: {} },
    },
  },
};

module.exports = {
  messageSwagger,
};