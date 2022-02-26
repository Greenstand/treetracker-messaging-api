const Joi = require('joi');
const log = require('loglevel');

const { getAuthors } = require('../services/AuthorService');

const authorGetQuerySchema = Joi.object({
  id: Joi.string().uuid(),
}).unknown(false);

const authorGet = async (req, res, _next) => {
  try {
    await authorGetQuerySchema.validateAsync(req.query, { abortEarly: false });
    const result = await getAuthors(req.query);
    res.send(result);
    res.end();
  } catch (e) {
    log.error(e);
    _next(e);
  }
};

module.exports = {
  authorGet,
};
