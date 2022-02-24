require('dotenv').config();
const request = require('supertest');
const { expect } = require('chai');
const server = require('../server/app');
// const { author_one_id, author_two_id } = require('./seed-data-creation');
// const { author_one_handle, author_two_handle } = require('./generic-class');
const knex = require('../server/database/knex');

// Mock Data
const { v4: uuid } = require('uuid');

const author_one_id = uuid();
const author_two_id = uuid();
const author_three_id = uuid();
const author_four_id = uuid();
const author_one_handle = 'handle1';
const author_two_handle = 'handle2';
const author_three_handle = 'handle3';
const author_four_handle = 'handle4';


describe('Author API tests.', () => {

  before(async function () {
    await knex.raw(`
    DELETE FROM bulk_message;
    DELETE FROM message;
    DELETE FROM content;
    DELETE FROM author;
    DELETE FROM survey_question;
    DELETE FROM survey;
    `);

    await knex.raw(`
    INSERT INTO author(
	    id, handle, created_at)
	  VALUES 
        ('${author_one_id}', '${author_one_handle}', now()),
        ('${author_two_id}', '${author_two_handle}', now());
        `);

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
