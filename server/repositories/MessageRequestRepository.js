const BaseRepository = require('./BaseRepository');

class MessageRequestRepository extends BaseRepository {
  constructor(session) {
    super('message_request', session);
    this._tableName = 'message_request';
    this._session = session;
  }
}

module.exports = MessageRequestRepository;
