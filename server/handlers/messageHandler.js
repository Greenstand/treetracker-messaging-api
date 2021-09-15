const Joi = require('joi');

const HttpError = require('../utils/HttpError');
const Session = require('../models/Session');
const { createMessageResourse, getMessages } = require('../models/Message');
const MessageRepository = require('../repositories/MessageRepository');
const { getAuthorId } = require('./helpers');

const messageSendPostSchema = Joi.object({
  parent_message_id: Joi.string().uuid(),
  recipient_handle: Joi.string(),
  region_id: Joi.string().uuid(),
  organization_id: Joi.number().integer(),
  author_handle: Joi.string().required(),
  subject: Joi.string().required(),
  body: Joi.string().required(),
  survey: Joi.object({
    questions: Joi.array()
      .max(3)
      .items(
        Joi.object({
          question: Joi.string(),
          choices: Joi.array().items(Joi.string()),
        }),
      ),
  }),
})
  .unknown(false)
  .xor('region_id', 'recipient_handle', 'organization_id');

const messagePostSchema = Joi.object({
  parent_message_id: Joi.string().uuid(),
  recipient_handle: Joi.string(),
  author_handle: Joi.string().required(),
  subject: Joi.string().required(),
  body: Joi.string().required(),
  composed_at: Joi.date().iso().required(),
  survey_id: Joi.string().uuid(),
  survey_response: Joi.string(),
  video_link: Joi.string().uri(),
}).unknown(false);

const messageGetQuerySchema = Joi.object({
  author_handle: Joi.string().required(),
  limit: Joi.number().integer().greater(0).less(101),
  offset: Joi.number().integer().greater(-1),
  since: Joi.date().iso(),
}).unknown(false);

const messageGet = async (req, res, next) => {
  await messageGetQuerySchema.validateAsync(req.query, { abortEarly: false });
  const session = new Session();
  const messageRepo = new MessageRepository(session);

  let url = `${req.protocol}://${req.get('host')}/message?author_handle=${
    req.query.author_handle
  }`;

  const executeGetMessages = getMessages(messageRepo);
  const result = await executeGetMessages(req.query, url);
  res.send(result);
  res.end();
};

// Create a new message resource
const messagePost = async (req, res, next) => {
  await messagePostSchema.validateAsync(req.body, { abortEarly: false });
  const session = new Session();
  const messageRepo = new MessageRepository(session);

  // Get author id using author handle
  const author_id = await getAuthorId(req.body.author_handle);

  let recipient_id = null;

  // Get recipient id using recipient handle
  if (req.body.recipient_handle) {
    recipient_id = await getAuthorId(req.body.recipient_handle);
  }

  try {
    await session.beginTransaction();
    await createMessageResourse(messageRepo, {
      ...req.body,
      author_id,
      recipient_id,
    });
    await session.commitTransaction();
    res.status(200).send();
    res.end();
  } catch (e) {
    console.log(e);
    if (session.isTransactionInProgress()) {
      await session.rollbackTransaction();
    }
    res.status(422).json({ ...e });
  }
};

// Author a new message or group message
const messageSendPost = async (req, res, next) => {
  await messageSendPostSchema.validateAsync(req.body, { abortEarly: false });
  const session = new Session();

  // Get author id using author handle
  const messageRepo = new MessageRepository(session);
  const author_id = await getAuthorId(req.body.author_handle);

  let recipient_id = null;

  // Get recipient id using recipient handle
  if (req.body.recipient_handle) {
    recipient_id = await getAuthorId(req.body.recipient_handle);
  }
  try {
    await session.beginTransaction();
    await createMessageResourse(messageRepo, {
      ...req.body,
      author_id,
      recipient_id,
    });
    await session.commitTransaction();
    res.status(200).send();
    res.end();
  } catch (e) {
    console.log(e);
    if (session.isTransactionInProgress()) {
      await session.rollbackTransaction();
    }
    res.status(422).json({ ...e });
  }
};

module.exports = {
  messagePost,
  messageGet,
  messageSendPost,
};
