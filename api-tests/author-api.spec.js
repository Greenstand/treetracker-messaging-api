require('dotenv').config();
const request = require('supertest');
const { expect } = require('chai');
const server = require('../server/app');
const { author_one_id, author_two_id } = require('./seed-data-creation');
const { author_one_handle, author_two_handle } = require('./generic-class');
const { knex } = require('../server/database/knex');

describe('Author API tests.', () => {

  describe('Author GET', () => {
    it(`Should get authors successfully`, function (done) {
      request(server)
        .get(`/author`)
        .set('Accept', 'application/json')
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body).to.have.keys(['authors']);
          expect(res.body.authors).to.have.length(2);
          res.body.authors.map(
            (a) =>
              expect(
                (a.handle === author_one_handle && a.id === author_one_id) ||
                  (a.handle === author_two_handle && a.id === author_two_id),
              ).to.be.true,
          );
          return done();
        });
    });
  });

  describe('Author GET', () => {
    it(`Should get authors successfully with id query`, function (done) {
      request(server)
        .get(`/author`)
        .query({
          id: author_one_id,
        })
        .set('Accept', 'application/json')
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body).to.have.keys(['authors']);
          expect(res.body.authors).to.have.length(1);
          res.body.authors.map(
            (a) =>
              expect(a.handle === author_one_handle && a.id === author_one_id)
                .to.be.true,
          );
          return done();
        });
    });
  });
});
