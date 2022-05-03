const AuthorRepository = require('../repositories/AuthorRepository');
const HttpError = require('../utils/HttpError');

class Author {
  constructor(session) {
    this._authorRepository = new AuthorRepository(session);
  }

  static Author({ id, handle }) {
    return Object.freeze({
      id,
      handle,
    });
  }

  async getAuthors(filterCriteria = undefined) {
    const filter = { ...filterCriteria };

    const authors = await this._authorRepository.getByFilter(filter);
    return {
      authors: authors.map((row) => {
        return this.constructor.Author({ ...row });
      }),
    };
  }

  async getAuthorId(author_handle, errorOut = true) {
    const authorIdResponse = await this._authorRepository.getAuthorId(
      author_handle,
    );
    if (errorOut) {
      if (authorIdResponse.length < 1)
        throw new HttpError(404, 'Author handle not found');
    }

    return authorIdResponse[0]?.id;
  }
}

module.exports = Author;
