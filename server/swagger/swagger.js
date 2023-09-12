const { version } = require('../../package.json');

const swaggerConfig = {
  openapi: '3.0.0',
  info: {
    title: 'Treetracker API',
    version,
  },
};

const swaggerOptions = {
  explorer: true,
}

module.exports = {
  swaggerConfig,
  swaggerOptions
}