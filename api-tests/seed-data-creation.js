const { v4: uuid } = require('uuid');
const knex = require('../server/database/knex');

class GenericObject {
  constructor(payload) {
    this._object = payload;
  }

  delete_property(property) {
    delete this._object[property];
  }

  change_property(property, value) {
    this._object[property] = value;
  }
}
const existing_message = Object.freeze({
  id: uuid(),
});

const existing_region_object = Object.freeze({
  id: uuid(),
  name: 'Timbuktu',
  description: 'Timbuktu Timbuktu Timbuktu',
});

const author_one_id = uuid();
const author_two_id = uuid();

const author_one_handle = 'handle1';
const author_two_handle = 'handle2';

class RegionObject extends GenericObject {
  constructor() {
    super({
      name: 'Konoha',
      description: 'The hidden leaf village',
      shape: {
        type: 'Polygon',
        coordinates: [
          [
            [1, 2],
            [2, 3],
            [0, 3],
            [2, 8],
          ],
        ],
      },
      creator_user_id: 1,
      creator_organization_id: 7,
    });
  }
}

class MessagePostObject extends GenericObject {
  constructor() {
    super({
      parent_message_id: existing_message.id,
      recipient_handle: author_two_handle,
      author_handle: author_one_handle,
      subject: 'Subject',
      body: 'Bodyyy',
      composed_at: new Date().toISOString(),
      survey_response: 'string',
      video_link: 'https://www.string.com',
    });
  }
}

class MessageSendPostObject extends GenericObject {
  constructor() {
    super({
      parent_message_id: existing_message.id,
      recipient_handle: author_one_handle,
      author_handle: author_two_handle,
      subject: 'Subject of the message',
      body: 'Body of the message',
      survey: {
        questions: [
          {
            question: 'Wha is the capital of atlantis?',
            choices: ['konoha', "Bermuda's triangle"],
          },
        ],
      },
    });
  }
}

const message_delivery_id = uuid();

const region_object = new RegionObject();

before(async () => {
  await knex.raw(`
    INSERT INTO public.author(
	    id, handle, created_at)
	  VALUES 
        ('${author_one_id}', '${author_one_handle}', now()),
        ('${author_two_id}', '${author_two_handle}', now());

    INSERT INTO public.region(
        id, name, description, shape, created_at, creator_user_id, creator_organization_id, active)
        VALUES ('${existing_region_object.id}', '${existing_region_object.name}', '${existing_region_object.description}', null, now(), null, null, true);

    INSERT INTO public.message(
      id, author_id, subject, body, video_link, survey_id, survey_response, composed_at, created_at, active)
      VALUES ('${existing_message.id}', '${author_two_id}', 'subject', 'body', null, null, null, now(), now(), true);
    
    INSERT INTO public.message_delivery(
      id, parent_message_id, message_id, recipient_id, created_at)
      VALUES ('${message_delivery_id}', null, '${existing_message.id}', '${author_one_id}', now());
  `);
});

after(async () => {
  const messageSendPostObject = new MessageSendPostObject();
  const messagePostObject = new MessagePostObject();
  await knex.raw(`

    DELETE FROM public.message_delivery
    WHERE parent_message_id = '${message_delivery_id}';

    DELETE FROM public.message_delivery
    WHERE message_id = '${existing_message.id}';

    DELETE FROM public.message_request
    WHERE message_id = '${existing_message.id}' or author_handle = '${messageSendPostObject._object.author_handle}' or author_handle = '${messagePostObject._object.author_handle}';

    DELETE FROM public.message
    WHERE id = '${existing_message.id}' or (body = '${messageSendPostObject._object.body}' and subject = '${messageSendPostObject._object.subject}') or (body = '${messagePostObject._object.body}' and subject = '${messagePostObject._object.subject}');
    
    DELETE FROM public.author
	  WHERE id = '${author_one_id}' or id = '${author_two_id}';

    DELETE FROM public.region
    WHERE id = '${existing_region_object.id}' or (name = '${region_object._object.name}' and description = '${region_object._object.description}');
  `);
});

module.exports = {
  existing_region_object,
  existing_message,
  message_delivery_id,
  author_one_handle,
  RegionObject,
  MessagePostObject,
  MessageSendPostObject,
};
