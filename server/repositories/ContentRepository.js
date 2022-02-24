const expect = require('expect-runtime');
const BaseRepository = require('./BaseRepository');

class ContentRepository extends BaseRepository {
  constructor(session) {
    super('content', session);
    this._tableName = 'content';
    this._session = session;
  }

  // async createForOtherTables(object, tablename) {
  //   const result = await this._session
  //     .getDB()(tablename)
  //     .insert(object)
  //     .returning('*');
  //   expect(result).match([
  //     {
  //       id: expect.anything(),
  //     },
  //   ]);
  //   return result[0];
  // }

 
}

module.exports = ContentRepository;
