const log = require('loglevel');
const Joi = require('joi');

const {
  getMessages,
  createMessage,
  createBulkMessage,
  getMessagesCount,
} = require('../services/MessageService');

const HttpError = require('../utils/HttpError');

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
  parent_message_id: Joi.string().uuid(),
  recipient_handle: Joi.string(),
  author_handle: Joi.string().required(),
  type: Joi.string().required().valid('message', 'survey_response'),
  body: Joi.string(),
  survey_id: Joi.string().uuid(),
  survey_response: Joi.array().items(Joi.string()),
  video_link: Joi.string().allow(null, '').uri(),
  composed_at: Joi.date().iso().allow(null),
}).unknown(false);

const messageGetQuerySchema = Joi.object({
  handle: Joi.string().required(),
  limit: Joi.number().integer().greater(0).less(501),
  offset: Joi.number().integer().greater(-1),
  since: Joi.date().iso(),
}).unknown(false);

const messageSingleGetQuerySchema = Joi.object({
  message_id: Joi.string().uuid(),
});

const messageGet = async (req, res, next) => {
  try {
    const filter = req.query;
    await messageGetQuerySchema.validateAsync(filter, { abortEarly: false });

    const defaultRange = { limit: '100', offset: '0' };
    filter.limit = filter.limit ?? defaultRange.limit;
    filter.offset = filter.offset ?? defaultRange.offset;
    log.debug(filter);

    const messages = await getMessages(filter);
    const messagesCount = await getMessagesCount(filter);

    // offset starts from 0, hence the -1
    const noOfIterations = messagesCount / filter.limit - 1;
    const currentIteration = filter.offset / filter.limit;

    const url = `message?author_handle=${filter.author_handle}`;
    const urlWithLimitAndOffset = `${url}${
      filter.since ? `&since=${filter.since}` : ''
    }&limit=${filter.limit}&offset=`;

    const nextUrl =
      currentIteration < noOfIterations
        ? `${urlWithLimitAndOffset}${+filter.offset + +filter.limit}`
        : null;
    let prev = null;
    if (filter.offset - +filter.limit >= 0) {
      prev = `${urlWithLimitAndOffset}${+filter.offset - +filter.limit}`;
    }

    res.send({
      messages,
      links: {
        prev,
        next: nextUrl,
      },
    });
    res.end();
  } catch (e) {
    log.error(e);
    next(e);
  }
};

const messageSingleGet = async (req, res, _next) => {
  try {
    await messageSingleGetQuerySchema.validateAsync(req.params, {
      abortEarly: false,
    });
    const messages = await getMessages({
      messageId: req.params.message_id,
    });
    res.send(messages[0]);
    res.end();
  } catch (e) {
    log.error(e);
    _next(e);
  }
};

// Create a new message resource
const messagePost = async (req, res, next) => {
  try {
    log.warn(req.body);
    if (!req.body.body && !req.body.survey_id) {
      throw new HttpError(422, 'Body is required');
    }
    await messagePostSchema.validateAsync(req.body, { abortEarly: false });
    await createMessage(req.body);
    res.status(204).send();
    res.end();
  } catch (e) {
    log.info(e);
    next(e);
  }
};

// Author a new message or group message
const bulkMessagePost = async (req, res, next) => {
  try {
    await bulkMessagePostSchema.validateAsync(req.body, { abortEarly: false });
    const { region_id, organization_id } = req.body;
    if (!region_id && !organization_id) {
      throw new HttpError(
        422,
        'At least one of organization_id and region_id must be provided',
      );
    }

    await createBulkMessage(req.body);

    res.status(204).send();
    res.end();
  } catch (e) {
    next(e);
  }
};

module.exports = {
  messagePost,
  messageGet,
  bulkMessagePost,
  messageSingleGet,
};
