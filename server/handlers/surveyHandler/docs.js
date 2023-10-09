const j2s = require('joi-to-swagger');
const { surveyIdParamSchema } = require('./schemas');

const { swagger: swaggerSurveyIdParamSchema } = j2s(surveyIdParamSchema);

const singleCaptureSurveyResponse = {
  content: {
    'application/json': {
      schema: {
        $ref: '#/components/schemas/Survey',
      },
    },
  },
};

const surveySwagger = {
  '/survey/{uuid}': {
    get: {
      tags: ['Survey'],
      parameters: [
        {
          schema: {
            ...swaggerSurveyIdParamSchema,
          },
          in: 'query',
          required: true,
          name: 'query',
          description: 'Survey UUID',
        },
      ],
      responses: {
        200: singleCaptureSurveyResponse,
      },
    },
  },
};

const surveyComponent = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    title: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' },
    active: { type: 'boolean' },
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          survey_id: { type: 'string', format: 'uuid' },
          prompt: { type: 'string' },
          rank: { type: 'string' },
          choices: { type: 'array', items: { type: 'string' } },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
    },
    responses: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          labels: { type: 'array' },
          dataset: { type: 'array' },
        },
      },
    },
  },
};

module.exports = {
  surveySwagger,
  surveyComponent,
};
