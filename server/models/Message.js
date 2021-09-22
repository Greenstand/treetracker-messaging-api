const { v4: uuid } = require('uuid');

const { getAuthorId } = require('../handlers/helpers');

const Message = ({
  parent_message_id,
  author_handle,
  recipient_handle,
  recipient_organization_id,
  recipient_region_id,
  subject,
  body,
  video_link,
  composed_at,
  survey_response,
  survey_id,
  title,
  prompt,
  choices,
}) =>
  Object.freeze({
    parent_message_id,
    from: author_handle,
    to: recipient_handle
      ? recipient_handle
      : recipient_organization_id
      ? recipient_organization_id
      : recipient_region_id,
    subject,
    body,
    composed_at,
    video_link,
    survey: {
      id: survey_id,
      title,
      response: survey_response ? true : false,
      questions: {
        prompt,
        choices,
      },
      answers: [''],
    },
  });

const MessageObject = ({
  subject,
  body,
  composed_at = new Date().toISOString(),
  survey_id = null,
  survey,
  survey_response = null,
  video_link = null,
  author_id,
  active = true,
}) =>
  Object.freeze({
    id: uuid(),
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

const createMessageResourse = async (messageRepo, requestBody) => {
  const messageObject = MessageObject({ ...requestBody });
  const message = await messageRepo.create(messageObject);

  const messageRequestObject = MessageRequestObject({
    ...requestBody,
    message_id: message.id,
  });
  await messageRepo.createForOtherTables(
    messageRequestObject,
    'message_request',
  );

  let parent_message_delivery_id = null;
  // if parent_message_id exists get the message_delivery_id for the parent message
  if (requestBody.parent_message_id) {
    parent_message_delivery_id = await messageRepo.getParentMessageDeliveryId(
      requestBody.parent_message_id,
    );
  }

  const messageDeliveryObject = MessageDeliveryObject({
    ...requestBody,
    message_id: message.id,
    parent_message_delivery_id,
  });
  await messageRepo.createForOtherTables(
    messageDeliveryObject,
    'message_delivery',
  );
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
  (messageRepo) =>
  async (filterCriteria = undefined, url) => {
    let filter = {};
    let options = { limit: 100, offset: 0 };
    const author_id = await getAuthorId(filterCriteria.author_handle);
    filter = FilterCriteria({
      ...filterCriteria,
      author_id,
    });
    options = { ...options, ...QueryOptions({ ...filterCriteria }) };

    let urlWithLimitAndOffset = `${url}&limit=${options.limit}&offset=`;

    let next = `${urlWithLimitAndOffset}${+options.offset + 1}`;
    let prev = null;
    if (options.offset - 1 >= 0) {
      prev = `${urlWithLimitAndOffset}${+options.offset - 1}`;
    }

    const messages = await messageRepo.getMessages(filter, options);
    return {
      messages: messages.map((row) => {
        return Message({ ...row });
      }),
      links: {
        prev,
        next,
      },
    };
  };

module.exports = {
  createMessageResourse,
  getMessages,
};
