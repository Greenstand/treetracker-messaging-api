const Joi = require('joi');

const Session = require('../models/Session');
const { createMessage, createBulkMessage } = require('../services/MessageService');

const { getMessages } = require('../models/Message');
const ContentRepository = require('../repositories/ContentRepository');
const { getAuthorId } = require('./helpers');
const HttpError = require('../utils/HttpError');

const messageSendPostSchema = Joi.object({
  parent_message_id: Joi.string().uuid(),
  recipient_handle: Joi.string(),
  region_id: Joi.string().uuid(),
  organization_id: Joi.string().uuid(),
  author_handle: Joi.string().required(),
  subject: Joi.string().required(),
  body: Joi.string().required(),
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
  subject: Joi.string().required(),
  body: Joi.string().required(),
  composed_at: Joi.date().iso().required(),
  survey_id: Joi.string().uuid(),
  survey_response: Joi.array().items(Joi.string()),
  video_link: Joi.string().allow(null, '').uri(),
}).unknown(false);

const messageGetQuerySchema = Joi.object({
  author_handle: Joi.string().required(),
  limit: Joi.number().integer().greater(0).less(101),
  offset: Joi.number().integer().greater(-1),
  since: Joi.date().iso(),
}).unknown(false);

const messageSingleGetQuerySchema = Joi.object({
  message_id: Joi.string().uuid(),
});

const messageGet = async (req, res, next) => {
  await messageGetQuerySchema.validateAsync(req.query, { abortEarly: false });
  const session = new Session();

  const url = `message?author_handle=${req.query.author_handle}`;
  const filter = req.query;

  try {
    const { messages, options } = await getMessages(session, filter);

    const urlWithLimitAndOffset = `${url}${filter.since ? `&since=${filter.since}` : ''
      }&limit=${options.limit}&offset=`;

    const nextUrl = `${urlWithLimitAndOffset}${+options.offset + +options.limit
      }`;
    let prev = null;
    if (options.offset - +options.limit >= 0) {
      prev = `${urlWithLimitAndOffset}${+options.offset - +options.limit}`;
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
    next(e);
  }
};

const messageSingleGet = async (req, res, next) => {
  await messageSingleGetQuerySchema.validateAsync(req.params, {
    abortEarly: false,
  });
  const session = new Session();
  const executeGetMessages = getMessages(session);
  const {
    messages: [message = {}],
  } = await executeGetMessages({
    messageId: req.params.message_id,
  });
  res.send(message);
  res.end();
};

// Create a new message resource
const messagePost = async (req, res, next) => {
  console.log("messagePost");
  try {
    await messagePostSchema.validateAsync(req.body, { abortEarly: false });
    await createMessage(req.body);
    res.status(204).send();
    res.end();
  } catch (e) {
    console.log(e);
    next(e);
  }
};

// Author a new message or group message
const messageSendPost = async (req, res, next) => {

  try {
    await messageSendPostSchema.validateAsync(req.body, { abortEarly: false });
    const { recipient_handle, region_id, organization_id } = req.body;
    if (!recipient_handle && !region_id && !organization_id) {
      throw new HttpError(
        422,
        'At least one of recipient_handle, organization_id and region_id must be provided',
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
  messageSendPost,
  messageSingleGet,
};
