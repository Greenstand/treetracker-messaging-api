const authorSeed = require('./01_table_author');

exports.seed = async function (knex) {
  // Author table is globally populated
  const authorId = knex('author')
    .where({ handle: authorSeed.author_one_handle })
    .pluck('id');
  const recipientId = knex('author')
    .where({ handle: authorSeed.author_two_handle })
    .pluck('id');

  const contentOfFirstMessage = {
    type: 'message',
    author_id: authorId,
    subject: '',
    body: 'Greetings, can you confirm that you have uploaded?',
    composed_at: '2022-01-22',
  };
  const firstContentId = knex('content')
    .insert(contentOfFirstMessage)
    .returning('id');

  // get content
  const firstMessage = {
    content_id: firstContentId,
    recipient_id: recipientId,
  };
  const firstMessageid = knex('message').insert(firstMessage).returning('id');

  const contentOfSecondMessage = {
    type: 'message',
    author_id: recipientId,
    subject: '',
    body: 'I have, I have?',
    composed_at: '2022-01-22',
  };
  const secondContentId = knex('content')
    .insert(contentOfSecondMessage)
    .returning('id');

  // get content
  const secondMessage = {
    parent_message_id: firstMessageid,
    content_id: secondContentId,
    recipient_id: authorId,
  };
  const _secondMessageid = knex('message')
    .insert(secondMessage)
    .returning('id');
};
