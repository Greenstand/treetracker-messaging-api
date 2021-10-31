require('dotenv').config();
const request = require('supertest');
const { expect } = require('chai');
const server = require('../server/app');
const { existing_region_object } = require('./seed-data-creation');
const RegionObject = require('./region-class');

describe('Region API tests.', () => {
  it(`Should raise validation error with error code 422 -- name is required `, function (done) {
    const regionObject = new RegionObject();
    regionObject.delete_property('name');
    request(server)
      .post(`/region`)
      .send(regionObject._object)
      .set('Accept', 'application/json')
      .expect(422)
      .end(function (err) {
        if (err) return done(err);
        return done();
      });
  });

  it(`Should raise validation error with error code 422 -- description is required `, function (done) {
    const regionObject = new RegionObject();
    regionObject.delete_property('description');
    request(server)
      .post(`/region`)
      .send(regionObject._object)
      .set('Accept', 'application/json')
      .expect(422)
      .end(function (err) {
        if (err) return done(err);
        return done();
      });
  });

  it(`Should raise validation error with error code 422 -- creator_user_id is not a number `, function (done) {
    const regionObject = new RegionObject();
    regionObject.change_property('creator_user_id', 'creator_user_id');
    request(server)
      .post(`/region`)
      .send(regionObject._object)
      .set('Accept', 'application/json')
      .expect(422)
      .end(function (err) {
        if (err) return done(err);
        return done();
      });
  });

  it(`Should raise validation error with error code 422 -- creator_organization_id is not a number `, function (done) {
    const regionObject = new RegionObject();
    regionObject.change_property(
      'creator_organization_id',
      'creator_organization_id',
    );
    request(server)
      .post(`/region`)
      .send(regionObject._object)
      .set('Accept', 'application/json')
      .expect(422)
      .end(function (err) {
        if (err) return done(err);
        return done();
      });
  });

  it(`Should raise validation error with error code 422 -- shape is not an object `, function (done) {
    const regionObject = new RegionObject();
    regionObject.change_property('shape', 'shape');
    request(server)
      .post(`/region`)
      .send(regionObject._object)
      .set('Accept', 'application/json')
      .expect(422)
      .end(function (err) {
        if (err) return done(err);
        return done();
      });
  });

  it(`Should raise validation error with error code 422 -- shape is not an object with type = Polygon `, function (done) {
    const regionObject = new RegionObject();
    regionObject.change_property('shape', {
      ...regionObject._object.shape,
      type: 'Not Polygon',
    });
    request(server)
      .post(`/region`)
      .send(regionObject._object)
      .set('Accept', 'application/json')
      .expect(422)
      .end(function (err) {
        if (err) return done(err);
        return done();
      });
  });

  it(`Should raise validation error with error code 422 -- shape is not an object with valid polygon coordinates `, function (done) {
    const regionObject = new RegionObject();
    regionObject.change_property('shape', {
      ...regionObject._object.shape,
      value: [
        [1, 2],
        [1, 3],
      ],
    });
    request(server)
      .post(`/region`)
      .send(regionObject._object)
      .set('Accept', 'application/json')
      .expect(422)
      .end(function (err) {
        if (err) return done(err);
        return done();
      });
  });

  describe('Region should be added sucessfully', () => {
    const regionObject = new RegionObject();
    it(`Region should be successfully added`, function (done) {
      request(server)
        .post(`/region`)
        .send(regionObject._object)
        .set('Accept', 'application/json')
        .expect(200)
        .end(function (err, res) {
          console.log(res.body);
          if (err) return done(err);
          return done();
        });
    });

    it('Added region should be persisted', function (done) {
      request(server)
        .get(`/region`)
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          expect(
            res.body.some(
              (region) =>
                region.name === regionObject._object.name &&
                region.description === regionObject._object.description,
            ),
          ).to.equal(true);
          return done();
        });
    });

    it('Get region by id', function (done) {
      request(server)
        .get(`/region/${existing_region_object.id}`)
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          expect(
            res.body.name === existing_region_object.name &&
              res.body.description === existing_region_object.description,
          ).to.equal(true);
          return done();
        });
    });
  });
});
