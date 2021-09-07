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

  async createMessageRequest(object) {
    const result = await this._session
      .getDB()('message_request')
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
}

module.exports = MessageRepository;
