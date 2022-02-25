const log = require('loglevel');
const Session = require('../models/Session');
const Message = require('../models/Message');

const createMessage = async (body) => {
  const session = new Session();
  try {
    await session.beginTransaction();
    await Message.createMessage(session, body);
    await session.commitTransaction();
  } catch (e) {
    log.info('Error:');
    log.info(e);
    if (session.isTransactionInProgress()) {
      await session.rollbackTransaction();
    }
    throw e;
  }
};

const createBulkMessage = async (body) => {
  const session = new Session();
  try {
    await session.beginTransaction();
    // if(we have an org id) {
    //  await GrowerAccountService.lookupRecipientIds
    // }
    // await Message.createBulkMessage(session, body, recipientIds);
    await Message.createBulkMessage(session, body);
    await session.commitTransaction();
  } catch (e) {
    log.info('Error:');
    log.info(e);
    if (session.isTransactionInProgress()) {
      await session.rollbackTransaction();
    }
    throw(e);
  }
}

module.exports = { createMessage, createBulkMessage };
