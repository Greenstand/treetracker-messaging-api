const MessageService = require('../../services/MessageService');
const HttpError = require('../../utils/HttpError');
const {
  getFilterAndLimitOptions,
  generatePrevAndNext,
} = require('../../utils/helper');
const {
  messageGetQuerySchema,
  messageSingleGetQuerySchema,
  messagePostSchema,
  bulkMessagePostSchema,
} = require('./schemas');

const messageGet = async (req, res) => {
  await messageGetQuerySchema.validateAsync(req.query, { abortEarly: false });

  const { filter, limitOptions } = getFilterAndLimitOptions(req.query);
  const messageService = new MessageService();

  const messages = await messageService.getMessages(filter, limitOptions);
  const messagesCount = await messageService.getMessagesCount(filter);

  const url = 'message';

  const links = generatePrevAndNext({
    url,
    count: messagesCount,
    limitOptions,
    queryObject: { ...filter, ...limitOptions },
  });

  res.send({
    messages,
    links,
    query: { total: messagesCount, ...limitOptions, ...filter },
  });
};

const messageSingleGet = async (req, res) => {
  await messageSingleGetQuerySchema.validateAsync(req.params, {
    abortEarly: false,
  });

  const messageService = new MessageService();
  const [message] = await messageService.getMessages({
    messageId: req.params.message_id,
  });
  if (!message) {
    throw new HttpError(404, `message with ${req.params.message_id} not found`);
  }
  res.send(message);
  res.end();
};

// Create a new messageHandler resource
const messagePost = async (req, res) => {
  if (!req.body.body && !req.body.survey_id) {
    // throw new HttpError(422, 'Body is required');
    // if mobile error has been fixed we can bring the error back
    // to 'process' current failing bulk packs
    res.status(204).send();
    res.end();
  }
  await messagePostSchema.validateAsync(req.body, { abortEarly: false });
  const messageService = new MessageService();
  await messageService.createMessage(req.body);
  res.status(204).send();
  res.end();
};

// Author a new message or group message
const bulkMessagePost = async (req, res) => {
  await bulkMessagePostSchema.validateAsync(req.body, { abortEarly: false });
  const { region_id, organization_id } = req.body;
  if (!region_id && !organization_id) {
    throw new HttpError(
      422,
      'At least one of organization_id and region_id must be provided',
    );
  }

  const messageService = new MessageService();
  await messageService.createBulkMessage(req.body);

  res.status(204).send();
  res.end();
};

module.exports = {
  messagePost,
  messageGet,
  bulkMessagePost,
  messageSingleGet,
};
