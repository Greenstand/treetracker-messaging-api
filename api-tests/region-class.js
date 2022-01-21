const { v4: uuid } = require('uuid');
const { GenericObject } = require('./generic-class');

class RegionObject extends GenericObject {
  constructor() {
    super({
      name: 'Konoha',
      description: 'The hidden leaf village',
      shape: {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [1, 2],
              [2, 3],
              [0, 3],
              [2, 8],
            ],
          ],
        ],
      },
      creator_user_id: uuid(),
      creator_organization_id: uuid(),
    });
  }
}

module.exports = RegionObject;
