const log = require('loglevel');
const { v4: uuid } = require('uuid');

const { getAuthorId } = require('./Author');

const Survey = require('./Survey');

const ContentRepository = require('../repositories/ContentRepository');
const MessageRepository = require('../repositories/MessageRepository');
const BulkMessageRepository = require('../repositories/BulkMessageRepository');
const SurveyQuestionRepository = require('../repositories/SurveyQuestionRepository');

const Message = async ({
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
}) => {
  const answer = survey_response;
  let survey;
  if (!survey_id) {
    survey = null;
  } else {
    survey = {
      id: survey_id,
      title: survey_title,
      response: !!answer,
      questions,
      answers: answer?.length > 0 ? answer : null,
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
    survey,
  };

  return Object.freeze(rval);
};

const ContentObject = ({
  type = 'message',
  subject,
  body,
  composed_at = new Date().toISOString(),
  survey_id = null,
  survey_response,
  video_link = null,
  author_id,
  active = true,
}) =>
  Object.freeze({
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

const BulkMessageObject = ({
  author_handle,
  content_id,
  region_id = null,
  organization_id = null,
}) =>
  Object.freeze({
    id: uuid(),
    author_handle,
    content_id,
    recipient_region_id: region_id,
    recipient_organization_id: organization_id,
  });

const MessageObject = ({
  id,
  parent_message_id = null,
  content_id,
  sender_id,
  recipient_id,
}) =>
  Object.freeze({
    id,
    content_id,
    created_at: new Date().toISOString(),
    parent_message_id,
    sender_id,
    recipient_id,
  });

const createMessage = async (session, body) => {
  log.debug(body);
  const contentRepo = new ContentRepository(session);
  const messageRepo = new MessageRepository(session);

  if (body.id) {
    const existingMessageArray = await messageRepo.getByFilter({
      id: body.id,
    });
    const [existingMessage] = existingMessageArray;
    if (existingMessage) {
      return; // OK
    }
  }

  // Get author id using author handle
  const author_id = await getAuthorId(body.author_handle, session, true);

  // Get recipient id using recipient handle
  const recipient_id = await getAuthorId(body.recipient_handle, session, true);

  // add content resource
  const contentObject = ContentObject({ ...body, author_id });
  const content = await contentRepo.create(contentObject);

  // add message resource
  const messageObject = MessageObject({
    ...body,
    content_id: content.id,
    sender_id: author_id,
    recipient_id,
  });

  await messageRepo.create(messageObject);
};

const createBulkMessage = async (session, requestBody, recipientHandles) => {
  const contentRepo = new ContentRepository(session);
  const messageRepo = new MessageRepository(session);
  const bulkMessageRepo = new BulkMessageRepository(session);

  const recipientIds = await Promise.all(
    recipientHandles.map(async (row) => {
      return getAuthorId(row, session, false);
    }),
  );

  // If this has a survey object, create the survey
  let type = 'announce';
  let survey_id = null;
  if (requestBody.survey) {
    type = 'survey';
    const survey = await Survey.createSurvey(session, requestBody.survey);
    survey_id = survey.id;
  }

  // Insert content object
  const author_id = await getAuthorId(requestBody.author_handle, session);
  const contentObject = ContentObject({
    ...requestBody,
    survey_id,
    author_id,
    type,
  });
  const content = await contentRepo.create(contentObject);

  // Insert bulk messageobject
  const { organization_id, region_id } = requestBody;

  const bulkMessageObject = BulkMessageObject({
    ...requestBody,
    organization_id,
    region_id,
    content_id: content.id,
  });

  await bulkMessageRepo.create(bulkMessageObject);

  await Promise.all(
    recipientIds.map(async (recipientId) => {
      const messageObject = MessageObject({
        ...requestBody,
        content_id: content.id,
        sender_id: author_id,
        recipient_id: recipientId,
      });
      await messageRepo.create(messageObject);
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
};

const FilterCriteria = ({ handle, since, author_id, messageId }) => {
  return {
    handle,
    author_id,
    since: since ? new Date(since).toISOString() : since,
    messageId,
  };
};

const getMessages = async (session, filterCriteria = undefined) => {
  log.info('getMessages');

  const messageRepo = new MessageRepository(session);

  let filter = {};
  const options = {
    limit: filterCriteria.limit,
    offset: filterCriteria.offset,
  };

  let author_id;
  if (!filterCriteria.messageId) {
    author_id = await getAuthorId(filterCriteria.handle, session);
  }
  filter = FilterCriteria({
    ...filterCriteria,
    author_id,
  });

  log.info('getMessages');
  const messages = await messageRepo.getMessages(filter, options);
  return Promise.all(
    messages.map(async (row) => {
      let questionsArray = null;
      if (row.survey_id != null) {
        const surveyQuesetionRepo = new SurveyQuestionRepository(session);
        const questions = await surveyQuesetionRepo.getQuestionsForSurvey(
          row.survey_id,
        );
        questionsArray = await Promise.all(
          questions.map(async (question) => {
            return {
              prompt: question.prompt,
              choices: question.choices,
            };
          }),
        );
      }

      return Message({ ...row, questions: questionsArray });
    }),
  );
};

const getMessagesCount = async (session, filterCriteria = undefined) => {
  log.info('getMessagesCount');
  const messageRepo = new MessageRepository(session);

  let author_id;

  if (!filterCriteria.messageId) {
    author_id = await getAuthorId(filterCriteria.handle, session);
  }

  let filter = {};
  filter = FilterCriteria({
    ...filterCriteria,
    author_id,
  });

  return messageRepo.getMessagesCount(filter);
};

module.exports = {
  createMessage,
  createBulkMessage,
  getMessages,
  getMessagesCount,
};
