const Joi = require('joi');

const HttpError = require('../utils/HttpError');
const Session = require('../models/Session');
const {
  createMessageResourse,
  authorNewMessage,
  getMessages,
} = require('../models/Message');
const MessageRepository = require('../repositories/MessageRepository');

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
  video_link: Joi.string(),
}).unknown(false);

const messageGet = async (req, res, next) => {
  const session = new Session();
  const messageRepo = new MessageRepository(session);

  if (!req.query.author_handle) {
    throw new HttpError(400, 'author_handle is required as a query parameter');
  }

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

  //   Get author id using author handle
  const messageRepo = new MessageRepository(session);
  const authorIdResponse = await messageRepo.getAuthorId(
    req.body.author_handle,
  );
  if (authorIdResponse.length < 1)
    throw new HttpError(404, 'Author handle not found');

  //   if (authorIdResponse.length > 1)
  //     throw new HttpError(404, 'Multiple author handles found');
  try {
    await session.beginTransaction();
    await createMessageResourse(messageRepo, {
      ...req.body,
      author_id: authorIdResponse[0].id,
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

  //   Get author id using author handle
  const messageRepo = new MessageRepository(session);
  const authorIdResponse = await messageRepo.getAuthorId(
    req.body.author_handle,
  );
  if (authorIdResponse.length < 1)
    throw new HttpError(404, 'Author handle not found');

  //   if (authorIdResponse.length > 1)
  //     throw new HttpError(404, 'Multiple author handles found');
  try {
    await session.beginTransaction();
    await authorNewMessage(messageRepo, {
      ...req.body,
      author_id: authorIdResponse[0].id,
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
