const express = require('express');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const { join } = require('path');

const log = require('loglevel');
const HttpError = require('./utils/HttpError');
const { errorHandler } = require('./utils/utils');
const { handlerWrapper } = require('./utils/utils');
const router = require('./routes');
const { swaggerConfig, swaggerOptions } = require('./handlers/swaggerDoc');

const app = express();

if (['development', 'local'].includes(process.env.NODE_ENV)) {
  log.info('disable cors');
  app.use(cors());
}

/*
 * Check request
 */
app.use(
  handlerWrapper(async (req, _res, next) => {
    if (
      req.method === 'POST' ||
      req.method === 'PATCH' ||
      req.method === 'PUT'
    ) {
      if (req.headers['content-type'] !== 'application/json') {
        throw new HttpError(
          415,
          'Invalid content type. API only supports application/json',
        );
      }
    }
    next();
  }),
);

app.use(express.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(express.json()); // parse application/json

// routers
app.use('/', router);
app.use('/assets', express.static(join(__dirname, '..', '/assets')));
app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerConfig, swaggerOptions),
);

// Global error handler
app.use(errorHandler);

const { version } = require('../package.json');

app.get('*', function (req, res) {
  res.status(200).send(version);
});

module.exports = app;
