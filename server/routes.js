const express = require('express');

const router = express.Router();
const {
  messagePost,
  messageGet,
  messageSingleGet,
  bulkMessagePost,
} = require('./handlers/messageHandler/messageHandler');
const { surveyGet } = require('./handlers/surveyHandler/surveyHandler');
const { authorGet } = require('./handlers/authorHandler/authorHandler');
const { handlerWrapper } = require('./utils/utils');

router.get('/author', handlerWrapper(authorGet));

router.post('/message', handlerWrapper(messagePost));
router.get('/message', handlerWrapper(messageGet));
router.get('/message/:message_id', handlerWrapper(messageSingleGet));
router.post('/bulk_message', handlerWrapper(bulkMessagePost));

router.get('/survey/:uuid', handlerWrapper(surveyGet));

module.exports = router;
