const Joi = require('joi');

const MessageService = require('../services/MessageService');
const HttpError = require('../utils/HttpError');
const {
  getFilterAndLimitOptions,
  generatePrevAndNext,
} = require('../utils/helper');

const bulkMessagePostSchema = Joi.object({
  parent_message_id: Joi.string().uuid(),
  region_id: Joi.string().uuid(),
  organization_id: Joi.string().uuid(),
  author_handle: Joi.string().required(),
  subject: Joi.string().required(),
  body: Joi.string(),
  type: Joi.string().required().valid('announce', 'survey'),
  video_link: Joi.string().allow(null, '').uri(),
  survey: Joi.object({
    questions: Joi.array()
      .max(3)
      .items(
        Joi.object({
          prompt: Joi.string().required(),
          choices: Joi.array().items(Joi.string()).required(),
        }).unknown(false),
      )
      .required(),
    title: Joi.string().required(),
  }).unknown(false),
})
  .unknown(false)
  .oxor('recipient_handle', 'region_id')
  .oxor('recipient_handle', 'organization_id');

const messagePostSchema = Joi.object({
  id: Joi.string().uuid(),
  parent_message_id: Joi.string().uuid().allow(null),
  recipient_handle: Joi.string(),
  author_handle: Joi.string().required(),
  type: Joi.string().required().valid('message', 'survey_response'),
  body: Joi.string().allow(null, ''),
  survey_id: Joi.string().uuid().allow(null),
  survey_response: Joi.array().items(Joi.string().allow(null)).allow(null),
  video_link: Joi.string().allow(null, '').uri(),
  composed_at: Joi.date().iso().allow(null),
  bulk_pack_file_name: Joi.string(),
}).unknown(false);

const messageGetQuerySchema = Joi.object({
  handle: Joi.string().required(),
  limit: Joi.number().integer().greater(0).less(501),
  offset: Joi.number().integer().greater(-1),
  since: Joi.date().iso(),
  sort_by: Joi.string().allow('composed_at'),
  order: Joi.string().allow('desc', 'asc'),
}).unknown(false);

const messageSingleGetQuerySchema = Joi.object({
  message_id: Joi.string().uuid(),
});

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

// Create a new message resource
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
