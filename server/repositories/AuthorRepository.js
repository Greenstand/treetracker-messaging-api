const BaseRepository = require('./BaseRepository');

class AuthorRepository extends BaseRepository {
  constructor(session) {
    super('author', session);
    this._tableName = 'author';
    this._session = session;
  }

  async getAuthorId(handle) {
    console.log("handle");
    console.log(handle);
    return this._session
      .getDB()
      .select('id')
      .from('author')
      .where('handle', handle);
  }
}

module.exports = AuthorRepository;
