const { GenericObject } = require('./generic-class');

class RegionObject extends GenericObject {
  constructor() {
    super({
      name: 'Konoha',
      description: 'The hidden leaf village',
      shape: {
        type: 'Polygon',
        coordinates: [
          [
            [1, 2],
            [2, 3],
            [0, 3],
            [2, 8],
          ],
        ],
      },
      creator_user_id: 1,
      creator_organization_id: 7,
    });
  }
}

module.exports = RegionObject;
