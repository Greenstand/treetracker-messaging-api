require('dotenv').config();
const request = require('supertest');
const chai = require('chai');

const {expect} = chai;
chai.use(require('chai-like'));
chai.use(require('chai-things'));
const server = require('../server/app');
const knex = require('../server/database/knex');

// Global Seed
const databaseCleaner = require('../database/seeds/00_job_database_cleaner');
const authorSeed = require('../database/seeds/01_table_author');

describe('Author API tests.', () => {

  before(async function () {
    await databaseCleaner.seed(knex);
    await authorSeed.seed(knex);
  });

  describe('Author GET', () => {
    it(`Should get authors successfully`, function (done) {
      request(server)
        .get(`/author`)
        .set('Accept', 'application/json')
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body).to.have.keys(['authors']);
          expect(res.body.authors).to.have.length(15);
          expect(res.body.authors).to.be.an('array').that.contains.something.like({handle: authorSeed.author_one_handle})
          expect(res.body.authors).to.be.an('array').that.contains.something.like({handle: authorSeed.author_two_handle})
          return done();
        });
    });
  });

  describe('Author GET', () => {
    it(`Should get authors successfully with id query`, function (done) {
      request(server)
        .get(`/author`)
        .query({
          id: authorSeed.author_one_id,
        })
        .set('Accept', 'application/json')
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body).to.have.keys(['authors']);
          expect(res.body.authors).to.have.length(1);
          res.body.authors.map(
            (a) =>
              expect(a.handle === authorSeed.author_one_handle)
                .to.be.true,
          );
          return done();
        });
    });
  });
});
