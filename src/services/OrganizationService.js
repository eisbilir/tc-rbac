const Joi = require('joi')
const { Op } = require('sequelize')
const helper = require('../common/helper')
const errors = require('../common/errors')
const models = require('../models')

const Organization  = models.Organization   /** new line */

async function _checkIfSameNamedOrganizationExists(organizationName1) {    /** new lines */
    // We can't create another Role with the same name
    const organization = await Organization.findOne({
      where: {
        organizationName: { [Op.iLike]: organizationName1 }
      },
      raw: true
    })
    if (organization) {
      throw new errors.BadRequestError(`OrganizationName: "${organization.organizationName}" is already exists.`)
    }
  }

  async function getOrganization(currentUser, id) {          /**new lines */
    const organization = await Organization.findById(id)
    const organization1 = await Organization.findOne({
      where: {
        id
      }
    })
  
    return organization.toJSON()
  }

  getOrganization.schema = Joi.object().keys({          /**new lines */
    id: Joi.string().uuid().required(),
    fromDb: Joi.boolean()
  }).required()


  async function createOrganization(currentUser, organization) {
    // check permission
    _checkUserPermissionForWriteDeleteOrganization(currentUser)
    // check if another Role with the same name exists.
    await _checkIfSameNamedOrganizationExists(organization.organizationName)
  
    organization.createdBy = currentUser.userId
  
    const created = await Organization.create(organization)
    const entity = created.toJSON()
    return entity
  }
  
  createOrganization.schema = Joi.object().keys({
    currentUser: Joi.object().required(),
    organization: Joi.object().keys({
      organizationName: Joi.stringAllowEmpty(),
      adminEmail: Joi.string().max(1000),
      organizationDisplayName: Joi.string().max(100),
      organiationImageLogo: Joi.string().max(1000)
  
    }).required()
  }).required()

  async function updateOrganization(currentUser, id, data) {
    // check permission
    _checkUserPermissionForWriteDeleteOrganization(currentUser)
  
    const organization = await Organization.findById(id)
    // if name is changed, check if another Role with the same name exists.
    if (data.name && data.name.toLowerCase() !== organization.dataValues.organizationName.toLowerCase()) {
      await _checkIfSameNamedOrganizationExists(data.name)
    }
  
    data.updatedBy = await helper.getUserId(currentUser.userId)
    const updated = await organization.update(data)
    const entity = updated.toJSON()
  
    return entity
  }

  updateOrganization.schema = Joi.object().keys({
    currentUser: Joi.object().required(),
    id: Joi.string().uuid().required(),
    data: Joi.object().keys({
      organizationName: Joi.stringAllowEmpty(),
      adminEmail: Joi.string().max(1000),
      organizationDisplayName: Joi.string().max(100),
      organiationImageLogo: Joi.string().max(1000),
      listOfSkills: Joi.array().items(Joi.string().max(50).required()).allow(null)
    }).required()
  }).required()

  async function deleteOrganization(currentUser, id) {
    // check permission
    _checkUserPermissionForWriteDeleteOrganization(currentUser)
  
    const organization = await Organization.findById(id)
    await organization.destroy()
  }
  
  deleteOrganization.schema = Joi.object().keys({
    currentUser: Joi.object().required(),
    id: Joi.string().uuid().required()
  }).required()

  async function searchOrganizations(currentUser, criteria) {
    const filter = { [Op.and]: [] }
    // Apply name filter, allow partial match and ignore case
    if (criteria.keyword) {
      filter[Op.and].push({ organizationName: { [Op.like]: `%${criteria.keyword}%` } })
    }
    const queryCriteria = {
      where: filter,
      order: [['organizationName', 'asc']]
    }
    const organization = await Organization.findAll(queryCriteria)
    return organization
  }
  
  searchOrganizations.schema = Joi.object().keys({
    currentUser: Joi.object().required(),
    criteria: Joi.object().keys({
      keyword: Joi.string()
    }).required()
  }).required()

  module.exports = {
    getOrganization,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    searchOrganizations
  }