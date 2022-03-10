const authorSeed = require('./01_table_author');

exports.seed = async function (knex) {
 
  const contentOfFirstMessage = {
    type: 'message',
    author_id: authorSeed.author_one_id,
    body: 'Greetings, can you confirm that you have uploaded?',
    composed_at: '2022-01-22',
  };
  const firstContentId = (await knex('content')
    .insert(contentOfFirstMessage)
    .returning('id'))[0];

  const firstMessage = {
    content_id: firstContentId,
    recipient_id: authorSeed.author_two_id,
    sender_id: authorSeed.author_one_id,
  };
  const firstMessageid = (await knex('message').insert(firstMessage).returning('id'))[0];

  const contentOfSecondMessage = {
    type: 'message',
    author_id: authorSeed.author_two_id,
    body: 'I have, I have?',
    composed_at: '2022-01-22',
  };
  const secondContentId = (await knex('content')
    .insert(contentOfSecondMessage)
    .returning('id'))[0];

  // get content
  const secondMessage = {
    parent_message_id: firstMessageid,
    content_id: secondContentId,
    recipient_id: authorSeed.author_one_id,
    sender_id: authorSeed.author_two_id,
  };
  const _secondMessageid = await knex('message')
    .insert(secondMessage)
    .returning('id');
};
