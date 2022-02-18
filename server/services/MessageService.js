const Session = require('../models/Session');
const MessageRepository = require('../repositories/MessageRepository');
const MessageDeliveryRepository = require('../repositories/MessageDeliveryRepository');
const { getAuthorId } = require('../handlers/helpers.js');
const  {MessageObject, MessageDeliveryObject} = require('../models/Message')

const createMessage = async (body) => {
  const session = new Session();
  const messageRepo = new MessageRepository(session);
  const messageDeliveryRepo = new MessageDeliveryRepository(session);

  if (req.body.id) {
    const existingMessageArray = await messageRepo.getByFilter({
      id: req.body.id,
    });
    const [existingMessage] = existingMessageArray;
    if (existingMessage) {
      return;
    }
  }

  // Get author id using author handle
  const author_id = await getAuthorId(body.author_handle, session);

  // Get recipient id using recipient handle
  const recipient_id = await getAuthorId(body.recipient_handle, session);

  try {
    await session.beginTransaction();
    
    // add message resource
    const messageObject = MessageObject({ ...requestBody});
    const message = await messageRepo.create(messageObject);
    
    
    // add message_delivery resource

    // if parent_message_id exists get the message_delivery_id for the parent message
    if (requestBody.parent_message_id) {
      parent_message_delivery_id = await messageDeliveryRepo.getParentMessageDeliveryId(
        body.parent_message_id,
      );
    }

    const messageDeliveryObject = MessageDeliveryObject({
      ...body,
      message_id: message.id,
      parent_message_delivery_id,
    });
    
    messageDeliveryRepo.create(messageDeliveryObject);
 
    await session.commitTransaction();
    res.status(204).send();
    res.end();
  } catch (e) {
    console.log(e);
    if (session.isTransactionInProgress()) {
      await session.rollbackTransaction();
    }
    throw(e);
  }
}

// createMessageRequest