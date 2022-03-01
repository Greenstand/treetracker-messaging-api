const BaseRepository = require('./BaseRepository');

class BulkMessageRepository extends BaseRepository {
  constructor(session) {
    super('bulk_message', session);
    this._tableName = 'bulk_message';
    this._session = session;
  }
}

module.exports = BulkMessageRepository;
