const Session = require('../models/Session');
const { getAuthorId } = require('../handlers/helpers');
const Message = require('../models/Message');

const createMessage = async (body) => {
  const session = new Session();
  try {
    // await session.beginTransaction();
    await Message.createMessage(session, body);
    // await session.commitTransaction();
  } catch (e) {
    console.log('Error:');
    console.log(e);
    // if (session.isTransactionInProgress()) {
    // await session.rollbackTransaction();
    // }
    throw e;
  }
};

// createMessageRequest

module.exports = { createMessage };
