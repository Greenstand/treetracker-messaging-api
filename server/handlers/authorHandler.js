const Joi = require('joi');
const log = require('loglevel');

const AuthorService = require('../services/AuthorService');

const authorGetQuerySchema = Joi.object({
  id: Joi.string().uuid(),
}).unknown(false);

const authorGet = async (req, res, next) => {
  await authorGetQuerySchema.validateAsync(req.query, { abortEarly: false });
  try {
    const authorService = new AuthorService();
    const result = await authorService.getAuthors(req.query);
    res.send(result);
    res.end();
  } catch (e) {
    log.error(e);
    next(e);
  }
};

module.exports = {
  authorGet,
};
