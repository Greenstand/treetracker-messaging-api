const { v4: uuid } = require('uuid');

const RegionObject = ({
  name,
  description,
  shape = null,
  active = true,
  creator_user_id = null,
  creator_organization_id = null,
}) =>
  Object.freeze({
    id: uuid(),
    created_at: new Date().toISOString(),
    name,
    description,
    shape: shape ? shape.coordinates.join() : null,
    active,
    creator_user_id,
    creator_organization_id,
  });

module.exports = {
  RegionObject,
};
