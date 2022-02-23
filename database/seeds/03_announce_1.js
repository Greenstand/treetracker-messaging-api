const tag = "announce_1"
const messages = require('./data/'+tag+'/messages.json');
const message_deliveries = require('./data/'+tag+'/message_deliveries.json');
const message_requests = require('./data/'+tag+'/message_requests.json');

exports.seed = async function (knex) {
  const trx = await knex.transaction();
  await trx('message').insert(messages);
  await trx('message_delivery').insert(message_deliveries);
  await trx('message_request').insert(message_requests);
  await trx.commit();
};
