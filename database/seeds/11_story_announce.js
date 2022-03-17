const { v4: uuid } = require('uuid');
const authorSeed = require('./01_table_author');

const authorId = authorSeed.author_one_id;
const recipientId = authorSeed.author_two_id;
const messageId = uuid();
const organizationId = 'a8567323-88b1-4870-8c48-68d2da3ab356'; // from stakeholder-api seed
const organizationName = 'Greenstance';

const regionId = '9a8fa051-d8b8-44ff-96eb-cfce4d07bc8c';
const regionName = 'Palcil';


const seed = async function (knex) {
  const content = {
    type: 'announce',
    author_id: authorId,
    subject: 'Planting opportunity in your area',
    body: 'Reply to learn more',
    composed_at: '2022-01-22',
  };
  const contentId = (await knex('content').insert(content).returning('id'))[0];

  const bulkMessage = {
    author_handle: authorSeed.author_one_handle,
    content_id: contentId,
    recipient_organization_id: organizationId,
    recipient_region_id: regionId
  }
  await knex('bulk_message')
    .insert(bulkMessage);
  
  const message = {
    id: messageId,
    content_id: contentId,
    sender_id: authorId,
    recipient_id: recipientId
  };
  await knex('message').insert(message).returning('id');
};

module.exports = {
  seed,
  authorHandle: authorSeed.author_one_handle,
  recipientHandle: authorSeed.author_two_handle,
  organizationId,
  organizationName,
  regionId,
  regionName,
  messageId
}
