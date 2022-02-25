require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });

// setup log level
const log = require('loglevel');

if (process.env.NODE_LOG_LEVEL) {
  log.setDefaultLevel(process.env.NODE_LOG_LEVEL);
} else {
  log.setDefaultLevel('info');
}

const app = require('./app');

const port = process.env.NODE_PORT || 3006;

app.listen(port, () => {
  log.info(`listening on port:${port}`);
  log.debug('debug log level!');
});
