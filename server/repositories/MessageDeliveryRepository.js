const BaseRepository = require('./BaseRepository');

class MessageDeliveryRepository extends BaseRepository {
  constructor(session) {
    super('message', session);
    this._tableName = 'message_delivery';
    this._session = session;
  }

  async getParentMessageDeliveryId(parent_message_id) {
    const result = await this._session
      .getDB()
      .select('id')
      .from('message_delivery')
      .where('message_id', parent_message_id);

    return result[0].id;
  }
}

module.exports = MessageDeliveryRepository;