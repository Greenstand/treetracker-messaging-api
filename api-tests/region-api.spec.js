require('dotenv').config();
const { v4: uuid } = require('uuid');
const { _expect } = require('chai');
const request = require('./lib/supertest');
const server = require('../server/app');

const RegionObject = {
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
}

describe('Region API tests.', () => {
  it(`Should raise validation error with error code 422 -- name is required `, async () => {
    const regionObject = {...RegionObject}
    delete regionObject.name;
    const _res = await request(server)
      .post(`/region`)
      .send(regionObject)
      .set('Accept', 'application/json')
      .expect(422);
  });

  it(`Should raise validation error with error code 422 -- description is required `, async () => {
    const regionObject = {...RegionObject}
    delete regionObject.description;
    const _res = await request(server)
      .post(`/region`)
      .send(regionObject)
      .set('Accept', 'application/json')
      .expect(422);
  });

  it(`Should raise validation error with error code 422 -- creator_user_id is not a uuid `, async () => {
    const regionObject = {...RegionObject}
    regionObject.creator_user_id = 'creator_user_id';
    const _res = await request(server)
      .post(`/region`)
      .send(regionObject)
      .set('Accept', 'application/json')
      .expect(422);
  });

  it(`Should raise validation error with error code 422 -- creator_organization_id is not a uuid `, async () => {
    const regionObject = {...RegionObject}
    regionObject.creator_organization_id = 'creator_organization_id';
    const _res = await request(server)
      .post(`/region`)
      .send(regionObject)
      .set('Accept', 'application/json')
      .expect(422);
  });

  it(`Should raise validation error with error code 422 -- shape is not an object `, async () => {
    const regionObject = {...RegionObject}

    regionObject.shape = 'shape';
    const _res = await request(server)
      .post(`/region`)
      .send(regionObject)
      .set('Accept', 'application/json')
      .expect(422);
  });

  it(`Should raise validation error with error code 422 -- shape is not an object with type = Polygon `, async () => {
    const regionObject = {...RegionObject}

    regionObject.shape = {
      ...regionObject.shape,
      type: 'Not Polygon',
    };
    const _res = await request(server)
      .post(`/region`)
      .send(regionObject)
      .set('Accept', 'application/json')
      .expect(422);
  });

  it(`Should raise validation error with error code 422 -- shape is not an object with valid polygon coordinates `, async () => {
    const regionObject = {...RegionObject}

    regionObject.shape = {
      ...regionObject.shape,
      value: [
        [1, 2],
        [1, 3],
      ],
    };
    const _res = await request(server)
      .post(`/region`)
      .send(regionObject)
      .set('Accept', 'application/json')
      .expect(422);
  });

  describe('Region should be added sucessfully', () => {
    const regionObject = {...RegionObject}

    it(`Region should be successfully added`, async () => {
      const _res = await request(server)
        .post(`/region`)
        .send(regionObject)
        .set('Accept', 'application/json')
        .expect(200);
    });

    it('Added region should be persisted', async () => {
      const _res = await request(server).get(`/region`).expect(200);
    });

    // TODO: needs seed
    // it.skip('Get region by id', async () => {
    //   request(server)
    //     .get(`/region/${existing_region_object.id}`)
    //     .expect(200)
    //     .end(function (err, res) {
    //       console.log(res.error);
    //       if (err) return done(err);
    //       expect(
    //         res.body.name === existing_region_object.name &&
    //           res.body.description === existing_region_object.description,
    //       ).to.equal(true);
    //       return done();
    //     });
    // });
  });
});
