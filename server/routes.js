const express = require('express');

const router = express.Router();
const {
  regionPost,
  regionGet,
  regionIdGet,
} = require('./handlers/regionHandler');
const {
  messagePost,
  messageGet,
  messageSingleGet,
  bulkMessagePost,
} = require('./handlers/messageHandler');
const {
  get,
} = require('./handlers/surveyHandler');
const { authorGet } = require('./handlers/authorHandler');
const { handlerWrapper } = require('./utils/utils');

router.get('/author', handlerWrapper(authorGet));

router.post('/region', handlerWrapper(regionPost));
router.get('/region', handlerWrapper(regionGet));
router.get('/region/:region_id', handlerWrapper(regionIdGet));

router.post('/message', handlerWrapper(messagePost));
router.get('/message', handlerWrapper(messageGet));
router.get('/message/:message_id', handlerWrapper(messageSingleGet));
router.post('/bulk_message', handlerWrapper(bulkMessagePost));

router.get('/survey/:uuid', handlerWrapper(get));

module.exports = router;
