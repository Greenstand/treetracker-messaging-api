const { version } = require('../../package.json');
const {
  authorSwagger,
  authorComponent,
} = require('./../handlers/authorHandler/docs');
const {
  messageSwagger,
} = require('./../handlers/messageHandler/docs');

const paths = {
  ...authorSwagger,
  ...messageSwagger,
};

const swaggerConfig = {
  openapi: '3.0.0',
  info: {
    title: 'Treetracker API',
    version,
  },
  paths,
  components: {
    schemas: {
      Tag: { ...authorComponent },
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