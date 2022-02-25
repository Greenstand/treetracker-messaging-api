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

const survey_id = uuid();

const organization_id = uuid();

const organization_id_two = uuid();

module.exports = {
  GenericObject,
  existing_message,
  survey_id,
  organization_id,
  organization_id_two,
};
