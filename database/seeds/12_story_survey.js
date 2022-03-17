const { v4: uuid } = require('uuid');
const authorSeed = require('./01_table_author');

const recipientId = authorSeed.author_two_id;
const recipientId2 = authorSeed.author_three_id;
const recipientId3 = authorSeed.author_four_id;
const authorId = authorSeed.author_one_id;
const messageId = uuid();
const surveyId = uuid();
const title = 'Number of trees planted today';
const organizationId = 'a8567323-88b1-4870-8c48-68d2da3ab356'; // from stakeholder-api seed
const regionId  = '9a8fa051-d8b8-44ff-96eb-cfce4d07bc8c'; // from region-api seed

const seed = async function (knex) {

  const survey = {
    id: surveyId,
    title,
  }
  await knex('survey').insert(survey).returning('id');

  const surveyQuesetion1 = {
    survey_id: surveyId,
    prompt: 'How many trees did you plant today?',
    rank: 1,
    choices: ['1', '10', '1000']
  }
  await knex('survey_question').insert(surveyQuesetion1)

  {
    const content = {
      type: 'survey',
      author_id: authorId,
      subject: 'Number of trees planted today',
      survey_id: surveyId,
      composed_at: '2022-01-22T00:00:00.000Z',
    };
    const contentId = (await knex('content')
      .insert(content)
      .returning('id'))[0];

    const bulkMessage = {
      author_handle: authorSeed.author_one_handle,
      content_id: contentId,
      recipient_organization_id: organizationId,
      recipient_region_id: regionId
    }
    await knex('bulk_message')
      .insert(bulkMessage);

    {
      const message = {
        id: messageId,
        content_id: contentId,
        sender_id: authorId,
        recipient_id: recipientId,
      };
      await knex('message').insert(message).returning('id');
    }

    {
      const message = {
        id: uuid(),
        content_id: contentId,
        sender_id: authorId,
        recipient_id: recipientId2,
      };
      await knex('message').insert(message).returning('id');
    }

    {
      const message = {
        id: uuid(),
        content_id: contentId,
        sender_id: authorId,
        recipient_id: recipientId3,
      };
      await knex('message').insert(message).returning('id');
    }
  }

  {
    const content = {
      type: 'survey_response',
      author_id: recipientId,
      subject: 'Number of trees planted today',
      survey_id: surveyId,
      survey_response: JSON.stringify(['1']),
      composed_at: '2022-01-22T00:00:01.000Z',
    };
    const contentId = (await knex('content')
      .insert(content)
      .returning('id'))[0];

    const message = {
      id: uuid(),
      content_id: contentId,
      sender_id: recipientId,
      recipient_id: authorId,
    };
    await knex('message').insert(message).returning('id');
  }

  {
    const content = {
      type: 'survey_response',
      author_id: recipientId2,
      subject: 'Number of trees planted today',
      survey_id: surveyId,
      survey_response: JSON.stringify(['10']),
      composed_at: '2022-01-22T00:10:01.000Z',
    };
    const contentId = (await knex('content')
      .insert(content)
      .returning('id'))[0];

    const message = {
      id: uuid(),
      content_id: contentId,
      sender_id: recipientId2,
      recipient_id: authorId,
    };
    await knex('message').insert(message).returning('id');
  }

  {
    const content = {
      type: 'survey_response',
      author_id: recipientId3,
      subject: 'Number of trees planted today',
      survey_id: surveyId,
      survey_response: JSON.stringify(['1000']),
      composed_at: '2022-01-22T00:30:01.000Z',
    };
    const contentId = (await knex('content')
      .insert(content)
      .returning('id'))[0];

    const message = {
      id: uuid(),
      content_id: contentId,
      sender_id: recipientId3,
      recipient_id: authorId,
    };
    await knex('message').insert(message).returning('id');
  }
}

module.exports = {
  seed,
  authorHandle: authorSeed.author_one_handle,
  recipientHandle: authorSeed.author_two_handle,
  messageId,
  surveyId,
  title,
}