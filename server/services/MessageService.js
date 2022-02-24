const Session = require('../models/Session');
const { getAuthorId } = require('../handlers/helpers');
const Message = require('../models/Message');

const createMessage = async (body) => {
  const session = new Session();
  try {
    // await session.beginTransaction();
    console.log('create message');
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

const createBulkMessage = async (body) => {
  const session = new Session();
  try {
    await session.beginTransaction();
    await Message.createBulkMessage(session, body);
    await session.commitTransaction();
  } catch (e) {
    console.log(e);
    if (session.isTransactionInProgress()) {
      await session.rollbackTransaction();
    }
    throw(e);
  }
}

module.exports = { createMessage, createBulkMessage };
