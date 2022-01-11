const { v4: uuid } = require('uuid');
const knex = require('../server/database/knex');
const {
  existing_message,
  author_one_handle,
  author_two_handle,
  survey_id,
} = require('./generic-class');
const RegionObject = require('./region-class');
const MessagePostObject = require('./message-post-class');
const MessageSendPostObject = require('./message-send-post-class');

const existing_region_object = Object.freeze({
  id: uuid(),
  name: 'Timbuktu',
  description: 'Timbuktu Timbuktu Timbuktu',
});

const survey_title = 'Just just another another random title';

const author_one_id = uuid();
const author_two_id = uuid();

const message_delivery_id = uuid();

const region_object = new RegionObject();

before(async () => {
  await knex.raw(`
    INSERT INTO author(
	    id, handle, created_at)
	  VALUES 
        ('${author_one_id}', '${author_one_handle}', now()),
        ('${author_two_id}', '${author_two_handle}', now());

    INSERT INTO region(
        id, name, description, shape, created_at, creator_user_id, creator_organization_id, active)
        VALUES ('${existing_region_object.id}', '${existing_region_object.name}', '${existing_region_object.description}', null, now(), null, null, true);

    INSERT INTO message(
      id, author_id, subject, body, video_link, survey_id, survey_response, composed_at, created_at, active)
      VALUES ('${existing_message.id}', '${author_two_id}', 'subject', 'body', null, null, null, now(), now(), true);
    
    INSERT INTO message_delivery(
      id, parent_message_id, message_id, recipient_id, created_at)
      VALUES ('${message_delivery_id}', null, '${existing_message.id}', '${author_one_id}', now());

    INSERT INTO survey(
      id, title, active, created_at)
      VALUES ('${survey_id}', '${survey_title}', true, now());
  `);
});

after(async () => {
  const messageSendPostObject = new MessageSendPostObject();
  const messagePostObject = new MessagePostObject();

  const created_survey = await knex
    .select('id')
    .table('survey')
    .where('title', messageSendPostObject._object.survey.title);

  await knex.raw(`

    DELETE FROM message_delivery
    WHERE parent_message_id = '${message_delivery_id}';

    DELETE FROM message_delivery
    WHERE message_id = '${existing_message.id}';

    DELETE FROM message_request
    WHERE message_id = '${existing_message.id}' or author_handle = '${messageSendPostObject._object.author_handle}' or author_handle = '${messagePostObject._object.author_handle}';

    DELETE FROM message
    WHERE id = '${existing_message.id}' or (body = '${messageSendPostObject._object.body}' and subject = '${messageSendPostObject._object.subject}') or (body = '${messagePostObject._object.body}' and subject = '${messagePostObject._object.subject}');

    DELETE FROM survey_question
    WHERE survey_id = '${created_survey[0].id}';

    DELETE FROM survey
    WHERE id = '${survey_id}' or title = '${messageSendPostObject._object.survey.title}';
    
    DELETE FROM author
	  WHERE id = '${author_one_id}' or id = '${author_two_id}';

    DELETE FROM region
    WHERE id = '${existing_region_object.id}' or (name = '${region_object._object.name}' and description = '${region_object._object.description}');
  `);
});

module.exports = {
  existing_region_object,
  existing_message,
  message_delivery_id,
  author_one_handle,
  author_two_handle,
  survey_title,
  author_one_id,
  author_two_id,
};
