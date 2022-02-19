const Session = require('../models/Session');
const AuthorRepository = require('../repositories/AuthorRepository');
const HttpError = require('../utils/HttpError');

const getAuthorId = async (author_handle, session, errorOut = true) => {
  //   Get author id using author handle
  const authorRepository = new AuthorRepository(session);
  const authorIdResponse = await authorRepository.getAuthorId(author_handle);
  if (errorOut) {
    if (authorIdResponse.length < 1)
      throw new HttpError(404, 'Author handle not found');
  }

  //   if (authorIdResponse.length > 1)
  //     throw new HttpError(404, 'Multiple author handles found');

  return authorIdResponse[0]?.id;
};

module.exports = { getAuthorId };
