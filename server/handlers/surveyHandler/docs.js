const j2s = require('joi-to-swagger');
const {
  surveyIdParamSchema,
} = require('./schemas');

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
        200: singleCaptureSurveyResponse
      },
    },
  },
};

const surveyComponent = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
  },
}

module.exports = {
  surveySwagger,
  surveyComponent,
};