const { version } = require('../../package.json');
const { authorSwagger } = require('./../handlers/authorHandler/docs');

const paths = {
  ...authorSwagger,
};

const swaggerConfig = {
  openapi: '3.0.0',
  info: {
    title: 'Treetracker API',
    version,
  },
  paths,
};

const swaggerOptions = {
  customCss: `
    .topbar-wrapper img { 
      content:url('../assets/greenstand.webp');
      width:80px; 
      height:auto;
    }
    `,
  explorer: true,
}

module.exports = {
  swaggerConfig,
  swaggerOptions
}