const j2s = require('joi-to-swagger');
const {
  bulkMessagePostSchema,
  messagePostSchema,
  messageSingleGetQuerySchema,
  messageGetQuerySchema,
} = require('./schemas');

const { swagger: swaggerMessagePostSchema } = j2s(messagePostSchema);
const { swagger: swaggerMessageSingleGetQuerySchema } = j2s(
  messageSingleGetQuerySchema,
);
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

const singleCaptureMessageGetResponse = {
  content: {
    'application/json': {
      schema: {
        $ref: '#/components/schemas/MessageGet',
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
      summary:
        'Retrieve messages for a handle since a specified date, with pagination. Includes both messages from and to the handle',
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
      responses: {
        200: singleCaptureMessageGetResponse,
      },
    },
  },
  '/message/{message_id}': {
    get: {
      tags: ['Message'],
      parameters: [
        {
          schema: {
            ...swaggerMessageSingleGetQuerySchema,
          },
          in: 'path',
          name: 'path',
          required: true,
          description: 'Message ID',
        },
      ],
      responses: {
        200: singleCaptureMessageResponse,
      },
    },
  },
  '/bulk_message': {
    post: {
      tags: ['Message'],
      summary:
        'Create a group message. Only one of recipient_handle or (organization_id and/or region_id) can be specified to direct a message to users. This is a special API path to be used by the admin panel tool to queue messages for delivery',
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

const messageProperties = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    type: { type: 'string' },
    parent_message_id: { type: 'string', format: 'uuid' },
    from: { type: 'string' },
    to: { type: 'string' },
    recipient_organization_id: { type: 'string', format: 'uuid' },
    recipient_region_id: { type: 'string', format: 'uuid' },
    subject: { type: 'string' },
    body: { type: 'string' },
    composed_at: { type: 'string', format: 'date-time' },
    video_link: { type: 'string' },
    survey_response: { type: 'array', items: { type: 'string' } },
    survey: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        title: { type: 'string' },
        questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              prompt: { type: 'string' },
              choices: { type: 'array', items: { type: 'string' } },
            },
          },
        },
        responses: { type: 'boolean' },
      },
    },
    bulk_pack_file_name: { type: 'string' },
    bulk_message_recipients: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          organization: { type: 'string' },
          region: { type: 'string' },
        },
      },
    },
  },
};

const messageComponent = {
  ...messageProperties,
};

const messageGetComponent = {
  type: 'object',
  properties: {
    links: {
      type: 'object',
      properties: {
        next: { type: 'string' },
        prev: { type: 'string' },
      },
    },
    query: {
      type: 'object',
      properties: {
        handle: { type: 'string' },
        limit: { type: 'number' },
        offset: { type: 'number' },
        since: { type: 'string', format: 'date-time' },
        sort_by: { type: 'string' },
        order: { type: 'string', enum: ['asc', 'desc'] },
      },
      required: ['handle'],
    },
    messages: {
      type: 'array',
      items: { ...messageProperties },
    },
  },
};

module.exports = {
  messageSwagger,
  messageComponent,
  messageGetComponent,
};
