const Chance = require('chance');
const { v4: uuid } = require('uuid');

const chance = new Chance();
const authorSeed = require('./01_table_author');

const admin_author_id = authorSeed.author_one_id;
const mobile_author_1_id = uuid();
const mobile_author_2_id = uuid();
const mobile_author_1 = 'mobile1@test';
const mobile_author_2 = 'mobile2@test';
const organizationId = 'a8567323-88b1-4870-8c48-68d2da3ab356'; // from stakeholder-api seed
const regionId  = '9a8fa051-d8b8-44ff-96eb-cfce4d07bc8c'; // from region-api seed


const fakeMessageContent = function () {
  return {
    type: 'message',
    author_id: admin_author_id,
    body: chance.sentence({ words: 12 }),
    composed_at: chance.date({ year: 2021 }).toISOString(),
  };
}

const seed = async function (knex) {

  // insert authors

  const authors = [];
  authors.push({ id: mobile_author_1_id, handle: mobile_author_1 });
  authors.push({ id: mobile_author_2_id, handle: mobile_author_2 });
  await knex('author').insert(authors);

  // a few normal messages to each
  for (let i = 0; i < 5; i += 1) {
    const contentId = (await knex('content')
      .insert(fakeMessageContent())
      .returning('id'))[0];

    const message = {
      content_id: contentId,
      recipient_id: mobile_author_1_id,
      sender_id: admin_author_id,
    };
    await knex('message').insert(message);
  }

  for (let i = 0; i < 5; i += 1) {

    const contentId = (await knex('content')
      .insert(fakeMessageContent())
      .returning('id'))[0];

    const message = {
      content_id: contentId,
      recipient_id: mobile_author_2_id,
      sender_id: admin_author_id,
    };
    await knex('message').insert(message);
  }


  // announce message to both
  {
    const content = {
      type: 'announce',
      author_id: admin_author_id,
      subject: 'Planting opportunity in your area',
      body: 'Reply to learn more',
      composed_at: '2022-01-22',
    };
    const contentId = (await knex('content').insert(content).returning('id'))[0];

    const bulkMessage = {
      author_handle: admin_author_id,
      content_id: contentId,
      recipient_organization_id: organizationId
    }
    await knex('bulk_message')
      .insert(bulkMessage);

    const message = {
      id: uuid(),
      content_id: contentId,
      sender_id: admin_author_id,
      recipient_id: mobile_author_1_id
    };
    await knex('message').insert(message).returning('id');

    const message2 = {
      id: uuid(),
      content_id: contentId,
      sender_id: admin_author_id,
      recipient_id: mobile_author_2_id
    };
    await knex('message').insert(message2).returning('id');
  }

  // annouce message to one
  {
    const content = {
      type: 'announce',
      author_id: admin_author_id,
      subject: 'Come pick up your trees today!',
      body: chance.sentence({ words: 30 }),
      composed_at: '2022-01-22',
    };
    const contentId = (await knex('content').insert(content).returning('id'))[0];

    const bulkMessage = {
      author_handle: admin_author_id,
      content_id: contentId,
      recipient_organization_id: organizationId
    }
    await knex('bulk_message')
      .insert(bulkMessage);

    const message = {
      id: uuid(),
      content_id: contentId,
      sender_id: admin_author_id,
      recipient_id: mobile_author_1_id
    };
    await knex('message').insert(message).returning('id');
  }

  // survey message to both
  {
    const surveyId = uuid();
    const survey = {
      id: surveyId,
      title: "Another kinds of trees survey",
    }
    await knex('survey').insert(survey).returning('id');

    const surveyQuesetion1 = {
      survey_id: surveyId,
      prompt: 'What kinds of trees did you plant today?',
      rank: 1,
      choices: ['Pine', 'Oak', 'Apple']
    }
    const surveyQuesetion2 = {
      survey_id: surveyId,
      prompt: 'Where did you plant today?',
      rank: 1,
      choices: ['At home', 'At the market', 'At the school']
    }
    const surveyQuesetion3 = {
      survey_id: surveyId,
      prompt: 'Did you plant alone?',
      rank: 1,
      choices: ['Yes', 'No', 'Sometimes']
    }
    await knex('survey_question').insert(surveyQuesetion1)
    await knex('survey_question').insert(surveyQuesetion2)
    await knex('survey_question').insert(surveyQuesetion3)

    {
      const content = {
        type: 'survey',
        author_id: admin_author_id,
        subject: 'More kinds of trees planted today',
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
          id: uuid(),
          content_id: contentId,
          sender_id: admin_author_id,
          recipient_id: mobile_author_1_id,
        };
        await knex('message').insert(message).returning('id');
      }

      {
        const message = {
          id: uuid(),
          content_id: contentId,
          sender_id: admin_author_id,
          recipient_id: mobile_author_2_id,
        };
        await knex('message').insert(message).returning('id');
      }
    }


    // one survey response

    {
      const content = {
        type: 'survey_response',
        author_id: mobile_author_2_id,
        subject: 'More kinds of trees planted today',
        survey_id: surveyId,
        survey_response: JSON.stringify({survey_response: ['Pine', 'At the market', 'Sometimes']}),
        composed_at: '2022-01-22T00:10:00.000Z',
      };
      const contentId = (await knex('content')
        .insert(content)
        .returning('id'))[0];

      const message = {
        id: uuid(),
        content_id: contentId,
        sender_id: mobile_author_2_id,
        recipient_id: admin_author_id,
      };
      await knex('message').insert(message).returning('id');
    }
  }


  // another survey
  {
    const surveyId = uuid();
    const survey = {
      id: surveyId,
      title: "Shorter Survey",
    }
    await knex('survey').insert(survey).returning('id');

    const surveyQuesetion1 = {
      survey_id: surveyId,
      prompt: 'Do you want more questions?',
      rank: 1,
      choices: ['Yes', 'No']
    }

    await knex('survey_question').insert(surveyQuesetion1)


    {
      const content = {
        type: 'survey',
        author_id: admin_author_id,
        subject: 'Shorter Survey',
        survey_id: surveyId,
        composed_at: '2022-01-22',
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
          id: uuid(),
          content_id: contentId,
          sender_id: admin_author_id,
          recipient_id: mobile_author_2_id,
        };
        await knex('message').insert(message).returning('id');
      }
    }
  }
}

module.exports = {
  seed,
}