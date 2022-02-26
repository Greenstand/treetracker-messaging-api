const { exist } = require('joi');
const { v4: uuid } = require('uuid');
const authorSeed = require('./01_table_author');

let recipientId = authorSeed.author_two_id;
let authorId = authorSeed.author_one_id;
let messageId = uuid();

const seed = async function (knex) {

  const content = {
    type: 'announce',
    author_id: authorId,
    subject: 'Planting opportunity in your area',
    body: 'Reply to learn more',
    composed_at: '2022-01-22',
  };
  const contentId = (await knex('content')
    .insert(content)
    .returning('id'))[0];

  recipientId = authorSeed.author_two_id;
  const message = {
    id: messageId,
    content_id: contentId,
    sender_id: authorId,
    recipient_id: recipientId,
  };
  await knex('message').insert(message).returning('id');

}

module.exports = {
  seed,
  authorHandle: authorSeed.author_one_handle,
  recipientHandle: authorSeed.author_two_handle,
  messageId
}