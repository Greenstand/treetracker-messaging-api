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
      id: 'd3b05f1b-c765-43f8-870d-4a3bb2ef277e',
      parent_message_id: existing_message.id,
      recipient_handle: author_two_handle,
      author_handle: author_one_handle,
      subject: 'Subject',
      body: 'Bodyyy',
      survey_id,
      composed_at: new Date().toISOString(),
      survey_response: ['answer 1'],
      video_link: 'https://www.string.com',
    });
  }
}

module.exports = MessagePostObject;
