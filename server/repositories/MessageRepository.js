const expect = require('expect-runtime');
const BaseRepository = require('./BaseRepository');
const MessageDeliveryRepository = require('../repositories/MessageDeliveryRepository');


class MessageRepository extends BaseRepository {
  constructor(session) {
    super('message', session);
    this._tableName = 'message';
    this._session = session;
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
        'author AS author_sender',
        'message.author_id',
        '=',
        'author_sender.id'
      )
      .leftJoin(
        'message_request',
        'message.id',
        '=',
        'message_request.message_id',
      )
      .innerJoin(
        'message_delivery',
        'message.id',
        '=',
        'message_delivery.message_id',
      )
      .innerJoin(
        'author AS author_recipient',
        'message_delivery.recipient_id',
        '=',
        'author_recipient.id'
      )
      .leftJoin('survey', 'survey.id', '=', 'message.survey_id')
      .leftJoin(
        'survey_question',
        'message.survey_id',
        '=',
        'survey_question.survey_id',
      )
      .select(
        'message_delivery.parent_message_id',
        'author_sender.handle as author_handle',
        'author_recipient.handle as recipient_handle',
        'message_request.recipient_organization_id',
        'message_request.recipient_region_id',
        'message.subject',
        'message.title as title',
        'message.body',
        'message.id',
        'message.video_link',
        'message.composed_at',
        'message.survey_response',
        'message.survey_id',
        'survey.title as survey_title',
        this._session
          .getDB()
          .raw(
            `json_agg(json_build_object('prompt', survey_question.prompt, 'choices', survey_question.choices)) as questions`,
          ),
      )
      .limit(limit)
      .groupBy( // TODO: what is going on with this group by clause, there are several content that would not be repeated
        'recipient_handle',
        'message.id',
        'message.survey_id',
        'message_delivery.parent_message_id',
        'author_handle',
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

}

module.exports = MessageRepository;
