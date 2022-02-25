const Joi = require('joi');

const Session = require('../models/Session');
const { getAuthors } = require('../models/Author');
const AuthorRepository = require('../repositories/AuthorRepository');

const authorGetQuerySchema = Joi.object({
  id: Joi.string().uuid(),
}).unknown(false);

const authorGet = async (req, res, _next) => {
  await authorGetQuerySchema.validateAsync(req.query, { abortEarly: false });
  const session = new Session();
  const authorRepo = new AuthorRepository(session);

  const executeGetAuthors = getAuthors(authorRepo);
  const result = await executeGetAuthors(req.query);
  res.send(result);
  res.end();
};

module.exports = {
  authorGet,
};
