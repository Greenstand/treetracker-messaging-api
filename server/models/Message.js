const log = require('loglevel');
const { v4: uuid } = require('uuid');

const Author = require('./Author');

const Survey = require('./Survey');

const ContentRepository = require('../repositories/ContentRepository');
const MessageRepository = require('../repositories/MessageRepository');
const BulkMessageRepository = require('../repositories/BulkMessageRepository');
const SurveyQuestionRepository = require('../repositories/SurveyQuestionRepository');

class Message {
  constructor(session) {
    this._session = session;
    this._contentRepository = new ContentRepository(session);
    this._messageRepository = new MessageRepository(session);
    this._author = new Author(session);
  }

  static Message({
    id,
    type,
    parent_message_id,
    author_handle,
    recipient_handle,
    recipient_organization_id,
    recipient_region_id,
    title,
    subject,
    body,
    video_link,
    composed_at,
    survey_response,
    survey_id,
    survey_title,
    questions,
    bulk_pack_file_name,
  }) {
    let survey;
    if (!survey_id) {
      survey = null;
    } else {
      survey = {
        id: survey_id,
        title: survey_title,
        questions,
        response: !!survey_response,
      };
    }

    const rval = {
      id,
      type,
      parent_message_id,
      title,
      from: author_handle,
      to: recipient_handle,
      recipient_organization_id,
      recipient_region_id,
      subject,
      body,
      composed_at,
      video_link,
      survey_response:
        survey_response?.survey_response?.length > 0
          ? survey_response.survey_response
          : null,
      survey,
      bulk_pack_file_name,
    };

    return Object.freeze(rval);
  }

  static ContentObject({
    type = 'message',
    subject,
    body,
    composed_at = new Date().toISOString(),
    survey_id = null,
    survey_response,
    video_link = null,
    author_id,
    active = true,
  }) {
    return Object.freeze({
      id: uuid(),
      type,
      created_at: new Date().toISOString(),
      subject,
      body,
      composed_at,
      survey_id,
      survey_response: survey_response ? { survey_response } : null,
      video_link,
      author_id,
      active,
    });
  }

  static BulkMessageObject({
    author_handle,
    content_id,
    region_id = null,
    organization_id = null,
  }) {
    return Object.freeze({
      id: uuid(),
      author_handle,
      content_id,
      recipient_region_id: region_id,
      recipient_organization_id: organization_id,
    });
  }

  static MessageObject({
    id,
    parent_message_id = null,
    content_id,
    sender_id,
    recipient_id,
    bulk_pack_file_name = null,
  }) {
    return Object.freeze({
      id,
      content_id,
      created_at: new Date().toISOString(),
      parent_message_id,
      sender_id,
      recipient_id,
      bulk_pack_file_name,
    });
  }

  static FilterCriteria({ handle, since, author_id, messageId }) {
    return {
      handle,
      author_id,
      since: since ? new Date(since).toISOString() : since,
      messageId,
    };
  }

  async createMessage(body) {
    log.debug(body);

    if (body.id) {
      const existingMessageArray = await this._messageRepository.getByFilter({
        id: body.id,
      });
      const [existingMessage] = existingMessageArray;
      if (existingMessage) {
        return; // OK
      }
    }

    // Get author id using author handle
    const author_id = await this._author.getAuthorId(body.author_handle, true);

    // Get recipient id using recipient handle
    const recipient_id = await this._author.getAuthorId(
      body.recipient_handle,
      true,
    );

    // add content resource
    const contentObject = this.constructor.ContentObject({
      ...body,
      author_id,
    });
    const content = await this._contentRepository.create(contentObject);

    // add message resource
    const messageObject = this.constructor.MessageObject({
      ...body,
      content_id: content.id,
      sender_id: author_id,
      recipient_id,
    });

    await this._messageRepository.create(messageObject);
  }

  async createBulkMessage(requestBody, recipientHandles) {
    const bulkMessageRepo = new BulkMessageRepository(this._session);

    const recipientIds = await Promise.all(
      recipientHandles.map(async (row) => {
        return this._author.getAuthorId(row, false);
      }),
    );

    const surveyModel = new Survey(this._session);

    // If this has a survey object, create the survey
    let type = 'announce';
    let survey_id = null;
    if (requestBody.survey) {
      type = 'survey';
      const survey = await surveyModel.createSurvey(requestBody.survey);
      survey_id = survey.id;
    }

    // Insert content object
    const author_id = await this._author.getAuthorId(requestBody.author_handle);
    const contentObject = this.constructor.ContentObject({
      ...requestBody,
      survey_id,
      author_id,
      type,
    });
    const content = await this._contentRepository.create(contentObject);

    // Insert bulk messageobject
    const { organization_id, region_id } = requestBody;

    const bulkMessageObject = this.constructor.BulkMessageObject({
      ...requestBody,
      organization_id,
      region_id,
      content_id: content.id,
    });

    await bulkMessageRepo.create(bulkMessageObject);

    await Promise.all(
      recipientIds.map(async (recipientId) => {
        const messageObject = this.constructor.MessageObject({
          ...requestBody,
          content_id: content.id,
          sender_id: author_id,
          recipient_id: recipientId,
        });
        await this._messageRepository.create(messageObject);
      }),
    );

    // if (region_id) {
    //   const regionRepo = new RegionRepository(session);
    //   regionInfo = await regionRepo.getById(region_id);
    // }
    // if (region_id) {
    //   // Get all recipients by region_id
    //   // create message_delivery for each of them
    //   // add return statement to prevent message_delivery being created for recipient_id, since that wasn't initially defined
    // }
  }

  async getMessages(filterCriteria = undefined, limitOptions) {
    log.info('getMessages');

    let filter = {};

    let author_id;
    if (!filterCriteria.messageId) {
      author_id = await this._author.getAuthorId(filterCriteria.handle);
    }
    filter = this.constructor.FilterCriteria({
      ...filterCriteria,
      author_id,
    });

    const messages = await this._messageRepository.getMessages(
      filter,
      limitOptions,
    );
    return Promise.all(
      messages.map(async (row) => {
        let questionsArray = null;
        if (row.survey_id != null) {
          const surveyQuesetionRepo = new SurveyQuestionRepository(
            this._session,
          );
          const questions = await surveyQuesetionRepo.getQuestionsForSurvey(
            row.survey_id,
          );
          questionsArray = questions.map((question) => {
            return {
              prompt: question.prompt,
              choices: question.choices,
            };
          });
        }

        return this.constructor.Message({ ...row, questions: questionsArray });
      }),
    );
  }

  async getMessagesCount(filterCriteria = undefined) {
    log.info('getMessagesCount');

    let author_id;

    if (!filterCriteria.messageId) {
      author_id = await this._author.getAuthorId(filterCriteria.handle);
    }

    let filter = {};
    filter = this.constructor.FilterCriteria({
      ...filterCriteria,
      author_id,
    });

    return this._messageRepository.getMessagesCount(filter);
  }
}

module.exports = Message;
