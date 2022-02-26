const AuthorRepository = require('../repositories/AuthorRepository');
const HttpError = require('../utils/HttpError');

const Author = ({ id, handle }) =>
  Object.freeze({
    id,
    handle,
  });

const getAuthors = async (session, filterCriteria = undefined) => {
  const filter = { ...filterCriteria };
  const authorRepository = new AuthorRepository(session);

  const authors = await authorRepository.getByFilter(filter);
  return {
    authors: authors.map((row) => {
      return Author({ ...row });
    }),
  };
};


const getAuthorId = async (author_handle, session, errorOut = true) => {
  //   Get author id using author handle
  const authorRepository = new AuthorRepository(session);
  const authorIdResponse = await authorRepository.getAuthorId(author_handle);
  if (errorOut) {
    if (authorIdResponse.length < 1)
      throw new HttpError(404, 'Author handle not found');
  }

  return authorIdResponse[0]?.id;
};

module.exports = { getAuthorId };

module.exports = {
  getAuthors,
  getAuthorId
};
