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

  getMessagesBaseQuery(filter) {
    const whereBuilder = function (object, builder) {
      let result = builder;
      // for /message/:message_id
      if (object.messageId) {
        result.where({ 'message.id': object.messageId });
      } else {
        if (object.since) {
          result = result.where('content.composed_at', '>=', object.since);
        }
        result.where( function() {
          this.where('content.author_id', object.author_id);
          this.orWhere('message.recipient_id', object.author_id);
        });
      
      }
      return result;
    };
    const baseQuery = this._session
      .getDB()('content')
      .innerJoin(
        'author AS author_sender',
        'content.author_id',
        '=',
        'author_sender.id',
      )
      .leftJoin('message', function () {
        this.on('content.id', '=', 'message.content_id').andOn(function () {
          this.onVal('content.type', '=', 'message')
            .orOnVal('content.type', '=', 'survey_response')
            .orOnVal(
              'message.recipient_id',
              '=',
              filter.author_id,
            )
  
        });
      })
      .leftJoin('bulk_message', 'content.id', '=', 'bulk_message.content_id')
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
      .where((builder) => whereBuilder(filter, builder));

    return baseQuery;
  }

  async getMessages(filter, { limit, offset }) {
    
    return this.getMessagesBaseQuery(filter)
      .select(
        'bulk_message.id as bulk_message_id',
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
      .limit(limit)
      .offset(offset)
      .orderBy('composed_at', 'asc');
  }

  async getMessagesCount(filter) {
    const result = await this.getMessagesBaseQuery(filter).count('*');

    return +result[0].count;
  }
}

module.exports = MessageRepository;
