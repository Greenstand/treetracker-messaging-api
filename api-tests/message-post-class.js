const {
  GenericObject,
  existing_message,
  author_two_handle,
  author_one_handle,
  survey_id,
} = require('./generic-class');

class MessagePostObject extends GenericObject {
  constructor() {
    super({
      parent_message_id: existing_message.id,
      recipient_handle: author_two_handle,
      author_handle: author_one_handle,
      subject: 'Subject',
      body: 'Bodyyy',
      survey_id,
      composed_at: new Date().toISOString(),
      survey_response: 'string',
      video_link: 'https://www.string.com',
    });
  }
}

module.exports = MessagePostObject;
