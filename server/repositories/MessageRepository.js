const BaseRepository = require('./BaseRepository');
const expect = require('expect-runtime');

class MessageRepository extends BaseRepository {
  constructor(session) {
    super('message', session);
    this._tableName = 'message';
    this._session = session;
  }

  async getAuthorId(handle) {
    return await this._session
      .getDB()
      .select('id')
      .from('author')
      .where('handle', handle);
  }

  async createForOtherTables(object, tablename) {
    const result = await this._session
      .getDB()(tablename)
      .insert(object)
      .returning('*');
    expect(result).match([
      {
        id: expect.anything(),
      },
    ]);
    return result[0];
  }

  async getMessages(filter, { limit, offset }) {
    const whereBuilder = function (object, builder) {
      let result = builder;
      result.where('message_request.author_handle', filter.author_handle);
      result.orWhere('message_delivery.recipient_id', filter.author_id);
      if (object.since) {
        result = result.andWhere('created_at', '>=', object.since);
      }
    };
    return await this._session
      .getDB()(this._tableName)
      .innerJoin(
        'message_request',
        'message.id',
        '=',
        'message_request.message_id',
      )
      .leftJoin(
        'message_delivery',
        'message.id',
        '=',
        'message_delivery.message_id',
      )
      .leftJoin('survey', 'survey.id', '=', 'message.survey_id')
      .leftJoin(
        'survey_question',
        'message.survey_id',
        '=',
        'survey_question.survey_id',
      )
      .limit(limit)
      .offset(offset)
      .where((builder) => whereBuilder(filter, builder));
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

module.exports = MessageRepository;
