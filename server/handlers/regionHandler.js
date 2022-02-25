const log = require('loglevel');
const Joi = require('joi');

const Session = require('../models/Session');
const RegionRepository = require('../repositories/RegionRepository');
const { RegionObject } = require('../models/Region');

const regionPostSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  shape: Joi.object({
    type: Joi.string().equal('MultiPolygon'),
    coordinates: Joi.array(),
  }).unknown(false),
  creator_user_id: Joi.string().uuid(),
  creator_organization_id: Joi.string().uuid(),
}).unknown(false);

const regionGet = async (req, res, _next) => {
  const session = new Session();
  const regionRepo = new RegionRepository(session);
  const result = await regionRepo.getRegions();
  res.send(result);
  res.end();
};

const regionSingleGetQuerySchema = Joi.object({
  region_id: Joi.string().uuid(),
});

const regionIdGet = async (req, res, _next) => {
  await regionSingleGetQuerySchema.validateAsync(req.params, {
    abortEarly: false,
  });
  const session = new Session();
  const regionRepo = new RegionRepository(session);
  const result = await regionRepo.getRegionById(req.params.region_id);
  res.send(result);
  res.end();
};

const regionPost = async (req, res, _next) => {
  await regionPostSchema.validateAsync(req.body, { abortEarly: false });
  const session = new Session();
  const regionRepo = new RegionRepository(session);

  try {
    const regionObject = RegionObject(req.body);
    await session.beginTransaction();
    await regionRepo.createRegion(regionObject);
    await session.commitTransaction();
    res.status(200).send();
    res.end();
  } catch (e) {
    log.info(e);
    if (session.isTransactionInProgress()) {
      await session.rollbackTransaction();
    }
    res.status(422).json({ ...e });
  }
};

module.exports = {
  regionPost,
  regionGet,
  regionIdGet,
};
