const { version } = require('../../package.json');
const {
  authorSwagger,
  authorComponent,
} = require('./../handlers/authorHandler/docs');
const {
  messageSwagger,
  messageComponent,
  messageGetComponent,
} = require('./../handlers/messageHandler/docs');
const {
  surveySwagger,
  surveyComponent,
} = require('./../handlers/surveyHandler/docs');

const paths = {
  ...authorSwagger,
  ...messageSwagger,
  ...surveySwagger,
};

const swaggerConfig = {
  openapi: '3.0.0',
  info: {
    title: 'Treetracker Messaging API',
    version,
  },
  paths,
  components: {
    schemas: {
      Author: { ...authorComponent },
      Message: { ...messageComponent },
      MessageGet: { ...messageGetComponent },
      Survey: { ...surveyComponent },
    },
  },
};

const swaggerOptions = {
  customCss: `
    .topbar-wrapper img { 
      content: url('../assets/greenstand.webp');
      width: 80px; 
      height: auto;
    }
  `,
  explorer: true,
}

module.exports = {
  swaggerConfig,
  swaggerOptions
}