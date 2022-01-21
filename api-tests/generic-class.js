const { v4: uuid } = require('uuid');

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

const author_one_handle = 'handle1';
const author_two_handle = 'handle2';

const survey_id = uuid();

const organization_id = uuid();

const organization_id_two = uuid();

module.exports = {
  GenericObject,
  existing_message,
  author_two_handle,
  author_one_handle,
  survey_id,
  organization_id,
  organization_id_two,
};
