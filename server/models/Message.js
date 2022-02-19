const { v4: uuid } = require('uuid');
const axios = require('axios').default;

const HttpError = require('../utils/HttpError'); // Move to handler
const { getAuthorId } = require('../handlers/helpers');

const MessageRepository = require('../repositories/MessageRepository');
const MessageDeliveryRepository = require('../repositories/MessageDeliveryRepository');
const RegionRepository = require('../repositories/RegionRepository');
const SurveyRepository = require('../repositories/SurveyRepository');
const SurveyQuestionRepository = require('../repositories/SurveyQuestionRepository');

const Session = require('./Session');

const Message = async ({
  id,
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
  const answer = survey_response?.survey_response;
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

  const to = [];

  if (recipient_handle) {
    to.push({ recipient: recipient_handle, type: 'user' });
  }

  if (recipient_organization_id) {
    // get organization name
    const stakeholderUrl = `${process.env.TREETRACKER_STAKEHOLDER_API_URL}/stakeholder`;
    const organizationResponse = await axios.get(
      `${stakeholderUrl}?stakeholder_uuid=${recipient_organization_id}`,
    );
    to.push({
      recipient: organizationResponse.data.stakeholders[0]?.name,
      type: 'organization',
    });
  }

  if (recipient_region_id) {
    // get region name
    const session = new Session();
    const regionRepo = new RegionRepository(session);
    const regionInfo = await regionRepo.getById(recipient_region_id);

    to.push({ recipient: regionInfo.name, type: 'region' });
  }

  return Object.freeze({
    id,
    parent_message_id,
    title,
    from: { author: author_handle, type: 'user' },
    to,
    subject,
    body,
    composed_at,
    video_link,
    survey,
  });
};

const MessageObject = ({
  id = uuid(),
  subject,
  body,
  composed_at = new Date().toISOString(),
  survey_id = null,
  survey_response,
  title = null,
  video_link = null,
  author_id,
  active = true,
}) =>
  Object.freeze({
    id,
    created_at: new Date().toISOString(),
    subject,
    body,
    title,
    composed_at,
    survey_id,
    survey_response: survey_response ? { survey_response } : null,
    video_link,
    author_id,
    active,
  });

const MessageRequestObject = ({
  author_handle,
  recipient_handle = null,
  parent_message_id = null,
  message_id,
  region_id = null,
  organization_id = null,
}) =>
  Object.freeze({
    id: uuid(),
    author_handle,
    recipient_handle,
    message_id,
    parent_message_id,
    recipient_region_id: region_id,
    recipient_organization_id: organization_id,
  });

const MessageDeliveryObject = ({
  parent_message_delivery_id = null,
  message_id,
  recipient_id,
}) =>
  Object.freeze({
    id: uuid(),
    created_at: new Date().toISOString(),
    parent_message_id: parent_message_delivery_id,
    recipient_id,
    message_id,
  });

const SurveyObject = ({ survey }) =>
  Object.freeze({
    id: uuid(),
    title: survey.title,
    created_at: new Date().toISOString(),
    active: true,
  });

const SurveyQuestionObject = ({ rank, prompt, choices, survey_id }) =>
  Object.freeze({
    id: uuid(),
    survey_id,
    rank,
    prompt,
    choices,
    created_at: new Date().toISOString(),
  });

const createMessage = async (session, body) => { 
  const messageRepo = new MessageRepository(session);
  const messageDeliveryRepo = new MessageDeliveryRepository(session);
  const surveyRepo = new SurveyRepository(session);
  const surveyQuestionRepo = new SurveyQuestionRepository(session);

  if (body.id) {
    console.log(`check for existing ${  body.id}`);
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

  // add message resource
  const messageObject = MessageObject({ ...body, author_id});
  const message = await messageRepo.create(messageObject);
    
    
  // add message_delivery resource

  // if parent_message_id exists get the message_delivery_id for the parent message
  let parent_message_delivery_id = null;
  if (body.parent_message_id) {
    parent_message_delivery_id = await messageDeliveryRepo.getParentMessageDeliveryId(
      body.parent_message_id,
    );
  }

  const messageDeliveryObject = MessageDeliveryObject({
    ...body,
    message_id: message.id,
    recipient_id,
    parent_message_delivery_id
  });
    
  messageDeliveryRepo.create(messageDeliveryObject);

  if (body.survey) { // not currently supported by POST /message
    const surveyObject = SurveyObject({ ...body.survey });
    const survey = surveyRepo.create(surveyObject);

    const survey_id = survey.id;

    let rank = 1;

    for (const { prompt, choices } of body.survey.questions) {
      const surveyQuestionObject = SurveyQuestionObject({
        survey_id,
        prompt,
        choices,
        rank,
      });
      rank++;
      surveyQuestionRepo.create(surveyQuestionObject);
    }
  }
}


const createMessageResourse = async (messageRepo, requestBody, session) => {
  let { survey_id } = requestBody;
  const { organization_id, region_id } = requestBody;

  const groundUserRecipientIds = [];
  let regionInfo;
  if (organization_id) {
    const groundUsersUrl = `${process.env.TREETRACKER_API_URL}/ground_users`; // this moves to the service

    // get ground_users in the specified organization from the treetracker-api
    const response = await axios.get(
      `${groundUsersUrl}?organization_id=${organization_id}`,
    );
    const { ground_users } = response.data;
    if (ground_users.length < 1) {
      throw new HttpError(
        422,
        'No ground users found in the specified organization',
      );
    }
    for (const { email, phone } of ground_users) {
      let recipient_id;
      if (email) {
        recipient_id = await getAuthorId(email, session, false);
      }
      if (!recipient_id && phone) {
        recipient_id = await getAuthorId(phone, session, false);
      }
      if (recipient_id) {
        groundUserRecipientIds.push(recipient_id);
      }
    }

    if (groundUserRecipientIds.length < 1)
      throw new HttpError(
        422,
        'No author handles found for any of the ground users found in the specified organization',
      );
  }

  if (region_id) {
    const regionRepo = new RegionRepository(session);
    regionInfo = await regionRepo.getById(region_id);
  }

  // IF this has a survey object, a message/send POST request
  if (requestBody.survey) {
    const surveyObject = SurveyObject({ ...requestBody });
    const survey = await messageRepo.createForOtherTables(
      surveyObject,
      'survey',
    );

    survey_id = survey.id;

    let rank = 1;

    for (const { prompt, choices } of requestBody.survey.questions) {
      const surveyQuestionObject = SurveyQuestionObject({
        survey_id,
        prompt,
        choices,
        rank,
      });
      rank++;
      await messageRepo.createForOtherTables(
        surveyQuestionObject,
        'survey_question',
      );
    }
  }

  const messageObject = MessageObject({ ...requestBody, survey_id });
  const message = await messageRepo.create(messageObject);

  const messageRequestObject = MessageRequestObject({
    ...requestBody,
    organization_id,
    region_id,
    message_id: message.id,
  });

  await messageRepo.createForOtherTables(
    messageRequestObject,
    'message_request',
  );

  let parent_message_delivery_id = null;

  // if parent_message_id exists get the message_delivery_id for the parent message
  const messageDeliveryRepo = new MessageDeliveryRepository(session); // TOOD: move to service
  if (requestBody.parent_message_id) {
    parent_message_delivery_id = await messageDeliveryRepo.getParentMessageDeliveryId(
      requestBody.parent_message_id,
    );
  }

  if (requestBody.recipient_id) {
    const messageDeliveryObject = MessageDeliveryObject({
      ...requestBody,
      message_id: message.id,
      parent_message_delivery_id,
    });
    await messageRepo.createForOtherTables(
      messageDeliveryObject,
      'message_delivery',
    );
    return;
  }

  if (organization_id) {
    // create message_delivery for each of the ground users' recipientIds
    for (const recipientId of groundUserRecipientIds) {
      const messageDeliveryObject = MessageDeliveryObject({
        ...requestBody,
        message_id: message.id,
        parent_message_delivery_id,
        recipient_id: recipientId,
      });
      await messageRepo.createForOtherTables(
        messageDeliveryObject,
        'message_delivery',
      );
    }
  }

  if (region_id) {
    // Get all recipients by region_id
    // create message_delivery for each of them
    // add return statement to prevent message_delivery being created for recipient_id, since that wasn't initially defined
  }
};

const FilterCriteria = ({ author_handle, since, author_id }) => {
  return {
    author_handle,
    author_id,
    since: since ? new Date(since).toISOString() : since,
  };
};

const QueryOptions = ({ limit = undefined, offset = undefined }) => {
  return Object.entries({ limit, offset })
    .filter((entry) => entry[1] !== undefined)
    .reduce((result, item) => {
      result[item[0]] = item[1];
      return result;
    }, {});
};

const getMessages =
  (session) =>
  async (filterCriteria = undefined, url) => {

    const messageRepo = new MessageRepository(session);

    let filter = {};
    let options = { limit: 100, offset: 0 };
    const author_id = await getAuthorId(filterCriteria.author_handle, session);
    filter = FilterCriteria({
      ...filterCriteria,
      author_id,
    });
    options = { ...options, ...QueryOptions({ ...filterCriteria }) };

    const urlWithLimitAndOffset = `${url}${
      filter.since ? `&since=${filter.since}` : ''
    }&limit=${options.limit}&offset=`;

    const next = `${urlWithLimitAndOffset}${+options.offset + +options.limit}`;
    let prev = null;
    if (options.offset - +options.limit >= 0) {
      prev = `${urlWithLimitAndOffset}${+options.offset - +options.limit}`;
    }

    const messages = await messageRepo.getMessages(filter, options);
    return {
      messages: await Promise.all(
        messages.map(async (row) => {
          return Message({ ...row });
        }),
      ),
      links: {
        prev,
        next,
      },
    };
  };

module.exports = {
  createMessage,
  createMessageResourse,
  getMessages,
};
