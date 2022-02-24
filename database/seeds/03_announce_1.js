const tag = 'announce_1';
/* eslint-disable */
const messages = require(`./data/${tag}/messages.json`);
const message_deliveries = require(`./data/${tag}/message_deliveries.json`);
const bulk_messages = require(`./data/${tag}/bulk_messages.json`);
/* eslint-enable */

exports.seed = async function (knex) {
  const trx = await knex.transaction();
  await trx('message').insert(messages);
  await trx('message_delivery').insert(message_deliveries);
  await trx('bulk_message').insert(bulk_messages);
  await trx.commit();
};
