const j2s = require('joi-to-swagger');
const {
  bulkMessagePostSchema,
  messagePostSchema,
  messageSingleGetQuerySchema,
  messageGetQuerySchema,
} = require('./schemas');

const { swagger: swaggerMessagePostSchema } = j2s(messagePostSchema);
const { swagger: swaggerMessageSingleGetQuerySchema } = j2s(messageSingleGetQuerySchema);
const { swagger: swaggerBulkMessagePostSchema } = j2s(bulkMessagePostSchema);
const { swagger: swaggerMessageGetQuerySchema } = j2s(messageGetQuerySchema);

const singleCaptureMessageResponse = {
  content: {
    'application/json': {
      schema: {
        $ref: '#/components/schemas/Message',
      },
    },
  },
};

const messageSwagger = {
  '/message': {
    post: {
      tags: ['Message'],
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
      tags: ['Message'],
      summary: 'Retrieve messages for a handle since a specified date, with pagination. Includes both messages from and to the handle',
      parameters: [
        {
          schema: {
            ...swaggerMessageGetQuerySchema,
          },
          in: 'query',
          name: 'query',
          description: 'Get Message',
        },
      ],
      responses: { 200: {} },
    },
  },
  '/message{message_id}': {
    get: {
      tags: ['Message'],
      parameters: [
        {
          schema: {
            ...swaggerMessageSingleGetQuerySchema,
          },
          in: 'query',
          name: 'query',
          required: true,
          description: 'Message ID',
        },
      ],
      responses: {
        200: singleCaptureMessageResponse,
      }
    },
  },
  '/bulk_message': {
    post: {
      tags: ['Message'],
      summary: 'Create a group message. Only one of recipient_handle or (organization_id and/or region_id) can be specified to direct a message to users. This is a special API path to be used by the admin panel tool to queue messages for delivery',
      requestBody: {
        content: {
          'application/json': {
            schema: { ...swaggerBulkMessagePostSchema },
          },
        },
      },
      responses: { 204: {} },
    },
  },
};

const messageComponent = {
  type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      content_id: { type: 'string', format: 'string' },
      sender_id: { type: 'string', format: 'string' },
      recipient_id: { type: 'string', format: 'string' },
  }
}

module.exports = {
  messageSwagger,
  messageComponent,
};