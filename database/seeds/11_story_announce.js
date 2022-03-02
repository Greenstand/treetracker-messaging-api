const { v4: uuid } = require('uuid');
const authorSeed = require('./01_table_author');

const authorId = authorSeed.author_one_id;
const recipient_organization_id = '8b2628b3-733b-4962-943d-95ebea918c9d'; // for 'test1' organization
const messageId = uuid();

const seed = async function (knex) {
  const content = {
    type: 'announce',
    author_id: authorId,
    subject: 'Planting opportunity in your area',
    body: 'Reply to learn more',
    composed_at: '2022-01-22',
  };
  const contentId = (await knex('content').insert(content).returning('id'))[0];

  const message = {
    id: messageId,
    content_id: contentId,
    sender_id: authorId,
    recipient_region_id: undefined,
    recipient_organization_id,
  };
  await knex('message').insert(message).returning('id');
};

module.exports = {
  seed,
  authorHandle: authorSeed.author_one_handle,
  recipientHandle: authorSeed.author_two_handle,
  messageId,
};
