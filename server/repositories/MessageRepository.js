const expect = require('expect-runtime');
const BaseRepository = require('./BaseRepository');

class MessageRepository extends BaseRepository {
  constructor(session) {
    super('message', session);
    this._tableName = 'message';
    this._session = session;
  }

  async getAuthorId(handle) {
    return this._session
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
        result = result.andWhere('message.created_at', '>=', object.since);
      }
    };
    return this._session
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
      .select(
        'message_request.parent_message_id',
        'message_request.author_handle',
        'message_request.recipient_handle',
        'message_request.recipient_organization_id',
        'message_request.recipient_region_id',
        'message.subject',
        'message.body',
        'message.video_link',
        'message.composed_at',
        'message.survey_response',
        'message.survey_id',
        'survey.title',
        this._session
          .getDB()
          .raw(
            `json_agg(json_build_object('prompt', survey_question.prompt, 'choices', survey_question.choices)) as questions`,
          ),
      )
      .limit(limit)
      .groupBy(
        'message_request.recipient_handle',
        'message.id',
        'message.survey_id',
        'message_request.parent_message_id',
        'message_request.author_handle',
        'message_request.recipient_organization_id',
        'message_request.recipient_region_id',
        'message.subject',
        'message.body',
        'message.video_link',
        'message.composed_at',
        'message.survey_response',
        'message.survey_id',
        'survey.title',
      )
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
