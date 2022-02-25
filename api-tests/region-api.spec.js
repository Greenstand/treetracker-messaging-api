require('dotenv').config();
const { _expect } = require('chai');
const request = require('./lib/supertest');
const server = require('../server/app');
const RegionObject = require('./region-class');

describe('Region API tests.', () => {
  it(`Should raise validation error with error code 422 -- name is required `, async () => {
    const regionObject = new RegionObject();
    regionObject.delete_property('name');
    const _res = await request(server)
      .post(`/region`)
      .send(regionObject._object)
      .set('Accept', 'application/json')
      .expect(422);
  });

  it(`Should raise validation error with error code 422 -- description is required `, async () => {
    const regionObject = new RegionObject();
    regionObject.delete_property('description');
    const _res = await request(server)
      .post(`/region`)
      .send(regionObject._object)
      .set('Accept', 'application/json')
      .expect(422);
  });

  it(`Should raise validation error with error code 422 -- creator_user_id is not a uuid `, async () => {
    const regionObject = new RegionObject();
    regionObject.change_property('creator_user_id', 'creator_user_id');
    const _res = await request(server)
      .post(`/region`)
      .send(regionObject._object)
      .set('Accept', 'application/json')
      .expect(422);
  });

  it(`Should raise validation error with error code 422 -- creator_organization_id is not a uuid `, async () => {
    const regionObject = new RegionObject();
    regionObject.change_property(
      'creator_organization_id',
      'creator_organization_id',
    );
    const _res = await request(server)
      .post(`/region`)
      .send(regionObject._object)
      .set('Accept', 'application/json')
      .expect(422);
  });

  it(`Should raise validation error with error code 422 -- shape is not an object `, async () => {
    const regionObject = new RegionObject();
    regionObject.change_property('shape', 'shape');
    const _res = await request(server)
      .post(`/region`)
      .send(regionObject._object)
      .set('Accept', 'application/json')
      .expect(422);
  });

  it(`Should raise validation error with error code 422 -- shape is not an object with type = Polygon `, async () => {
    const regionObject = new RegionObject();
    regionObject.change_property('shape', {
      ...regionObject._object.shape,
      type: 'Not Polygon',
    });
    const _res = await request(server)
      .post(`/region`)
      .send(regionObject._object)
      .set('Accept', 'application/json')
      .expect(422);
  });

  it(`Should raise validation error with error code 422 -- shape is not an object with valid polygon coordinates `, async () => {
    const regionObject = new RegionObject();
    regionObject.change_property('shape', {
      ...regionObject._object.shape,
      value: [
        [1, 2],
        [1, 3],
      ],
    });
    const _res = await request(server)
      .post(`/region`)
      .send(regionObject._object)
      .set('Accept', 'application/json')
      .expect(422);
  });

  describe('Region should be added sucessfully', () => {
    const regionObject = new RegionObject();
    it(`Region should be successfully added`, async () => {
      const _res = await request(server)
        .post(`/region`)
        .send(regionObject._object)
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
