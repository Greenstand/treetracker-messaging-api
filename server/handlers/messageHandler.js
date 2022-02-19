const Joi = require('joi');

const Session = require('../models/Session');
const { createMessage } = require('../services/MessageService');

const { createMessageResourse, getMessages } = require('../models/Message');
const MessageRepository = require('../repositories/MessageRepository');
const { getAuthorId } = require('./helpers');
const HttpError = require('../utils/HttpError');

const messageSendPostSchema = Joi.object({
  parent_message_id: Joi.string().uuid(),
  recipient_handle: Joi.string(),
  title: Joi.string(),
  region_id: Joi.string().uuid(),
  organization_id: Joi.string().uuid(),
  author_handle: Joi.string().required(),
  subject: Joi.string().required(),
  body: Joi.string().required(),
  video_link: Joi.string().uri(),
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

  const url = `message?author_handle=${req.query.author_handle}`;

  const executeGetMessages = getMessages(session);
  const result = await executeGetMessages(req.query, url);
  res.send(result);
  res.end();
};

// Create a new message resource
const messagePost = async (req, res, next) => {
  await messagePostSchema.validateAsync(req.body, { abortEarly: false });

  try {
    await createMessage(req.body);
    res.status(204).send();
    res.end();
  } catch(e) {
    next(e);
  }

  // Get author id using author handle
  // const author_id = await getAuthorId(req.body.author_handle);

  // let recipient_id = null;

  // // Get recipient id using recipient handle
  // if (req.body.recipient_handle) {
  //   recipient_id = await getAuthorId(req.body.recipient_handle);
  // }

  // try {
  //   await session.beginTransaction();
  //   await createMessageResourse(messageRepo, {
  //     ...req.body,
  //     author_id,
  //     recipient_id,
  //   });
  //   await session.commitTransaction();
  //   res.status(204).send();
  //   res.end();
  // } catch (e) {
  //   console.log(e);
  //   if (session.isTransactionInProgress()) {
  //     await session.rollbackTransaction();
  //   }
  //   next(e);
  // }
};

// Author a new message or group message
const messageSendPost = async (req, res, next) => {
  await messageSendPostSchema.validateAsync(req.body, { abortEarly: false });
  const { recipient_handle, region_id, organization_id } = req.body;
  if (!recipient_handle && !region_id && !organization_id) {
    throw new HttpError(
      422,
      'At least one of recipient_handle, organization_id and region_id must be provided',
    );
  }
  const session = new Session();

  // Get author id using author handle
  const messageRepo = new MessageRepository(session);
  const author_id = await getAuthorId(req.body.author_handle, session);

  let recipient_id = null;

  // Get recipient id using recipient handle
  if (req.body.recipient_handle) {
    recipient_id = await getAuthorId(req.body.recipient_handle, session);
  }
  try {
    await session.beginTransaction();
    await createMessageResourse(
      messageRepo,
      {
        ...req.body,
        author_id,
        recipient_id,
      },
      session,
    );
    await session.commitTransaction();
    res.status(204).send();
    res.end();
  } catch (e) {
    console.log(e);
    if (session.isTransactionInProgress()) {
      await session.rollbackTransaction();
    }
    next(e);
  }
};

module.exports = {
  messagePost,
  messageGet,
  messageSendPost,
};
