const messages = require('./data/conversation_1/messages.json');
const message_deliveries = require('./data/conversation_1/message_deliveries.json');
const bulk_messages = require('./data/conversation_1/bulk_messages.json');

exports.seed = async function (knex) {
  const trx = await knex.transaction();
  await trx('message').insert(messages);
  await trx('message_delivery').insert(message_deliveries);
  await trx('bulk_message').insert(bulk_messages);
  await trx.commit();
};
