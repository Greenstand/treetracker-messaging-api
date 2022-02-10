const {
  GenericObject,
  existing_message,
  author_two_handle,
  author_one_handle,
} = require('./generic-class');

class MessageSendPostObject extends GenericObject {
  constructor() {
    super({
      parent_message_id: existing_message.id,
      recipient_handle: author_one_handle,
      author_handle: author_two_handle,
      subject: 'Subject of the message',
      title: 'Title of the message',
      body: 'Body of the message',
      survey: {
        questions: [
          {
            prompt: 'What is the capital of atlantis?',
            choices: ['konoha', "Bermuda's triangle"],
          },
        ],
        title: 'Just a Random Survey',
      },
    });
  }
}

module.exports = MessageSendPostObject;
