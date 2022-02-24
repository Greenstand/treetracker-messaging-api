const BaseRepository = require('./BaseRepository');

class MessageRepository extends BaseRepository {
  constructor(session) {
    super('message', session);
    this._tableName = 'message';
    this._session = session;
  }

  async getParentMessageId(parent_message_id) {
    const result = await this._session
      .getDB()
      .select('id')
      .from('message')
      .where('message_id', parent_message_id);

    return result[0].id;
  }

  async getMessages(filter, { limit, offset }) {
    const whereBuilder = function (object, builder) {
      let result = builder;
      // for /message/:message_id
      if (object.messageId) {
        result.where({ 'message.id': object.messageId });
      } else {
        result.where('content.author_id', filter.author_id);
        result.orWhere('message.recipient_id', filter.author_id);
        if (object.since) {
          result = result.andWhere('message.created_at', '>=', object.since);
        }
      }
    };
    return this._session
      .getDB()('content')
      .innerJoin(
        'author AS author_sender',
        'content.author_id',
        '=',
        'author_sender.id',
      )
      .leftJoin(
        'message',
        function() {
          this.on( 'content.id',
                    '=',
                    'message.content_id')
            .andOn(function() {
              this.onVal( 'content.type', '=', 'message')
              .orOnVal( 'message.recipient_id', '=', filter.author_id)
          })
        })
      .leftJoin(
        'bulk_message',
        'content.id',
        '=',
        'bulk_message.content_id',
      )
      .leftJoin(
        'author AS author_recipient',
        'message.recipient_id',
        '=',
        'author_recipient.id',
      )
      .leftJoin('survey', 'survey.id', '=', 'content.survey_id')
      .leftJoin(
        'survey_question',
        'survey.id',
        '=',
        'survey_question.survey_id',
      )
      .select(
        'bulk_message.id',
        'message.id',
        'message.parent_message_id',
        'author_sender.handle as author_handle',
        'author_recipient.handle as recipient_handle',
        'bulk_message.recipient_organization_id',
        'bulk_message.recipient_region_id',
        'content.type',
        'content.subject',
        'content.body',
        'content.video_link',
        'content.composed_at',
        'content.survey_response',
        'content.survey_id',
        'survey.title as survey_title',
      )
      // .groupBy('recipient_handle')
      .limit(limit)
      
      // when there is an associate bulk_message object, there should only be one record

      // .groupBy(
      //   // TODO: what is going on with this group by clause, there are several content that would not be repeated
      //   'author_recipient.handle',
      //   'message.id',
      //   'message.survey_id',
      //   'message_delivery.parent_message_id',
      //   'author_sender.handle',
      //   'bulk_message.recipient_organization_id',
      //   'bulk_message.recipient_region_id',
      //   'message.subject',
      //   'message.body',
      //   'message.video_link',
      //   'message.composed_at',
      //   'message.survey_response',
      //   'message.survey_id',
      //   'survey.title',
      // )
      .offset(offset)
      .orderBy('composed_at', 'desc')
      .where((builder) => whereBuilder(filter, builder));
  }
}

module.exports = MessageRepository;
