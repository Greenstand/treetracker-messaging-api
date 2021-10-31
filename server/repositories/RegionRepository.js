const BaseRepository = require('./BaseRepository');
const HttpError = require('../utils/HttpError');

class RegionRepository extends BaseRepository {
  constructor(session) {
    super('region', session);
    this._tableName = 'region';
    this._session = session;
  }

  async getRegions() {
    return this._session
      .getDB()
      .select('id', 'name', 'description', 'created_at')
      .from(this._tableName)
      .orderBy('created_at', 'desc');
  }

  async getRegionById(id) {
    const object = await this._session
      .getDB()
      .select('name', 'description', 'shape', 'created_at')
      .table(this._tableName)
      .where('id', id)
      .first();
    if (!object) {
      throw new HttpError(404, `Can not found ${this._tableName} by id:${id}`);
    }
    return object;
  }
}

module.exports = RegionRepository;
