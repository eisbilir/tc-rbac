/**
 * This service provides operations of Roles.
 */

const Joi = require('joi')
const { Op } = require('sequelize')
const helper = require('../common/helper')
const errors = require('../common/errors')
const models = require('../models')

const Role = models.Role

/**
  * Check user permission for deleting, creating or updating role.
  * @param {Object} currentUser the user who perform this operation.
  * @returns {undefined}
  */
async function _checkUserPermissionForWriteDeleteRole(currentUser) {
  if (!currentUser.isAdmin && !currentUser.isMachine) {
    throw new errors.ForbiddenError('You are not allowed to perform this action!')
  }
}

/**
  * Check user permission for deleting, creating or updating role.
  * @param {Object} currentUser the user who perform this operation.
  * @returns {undefined}
  */
async function _checkIfSameNamedRoleExists(roleName) {
  // We can't create another Role with the same name
  const role = await Role.findOne({
    where: {
      name: { [Op.iLike]: roleName }
    },
    raw: true
  })
  if (role) {
    throw new errors.BadRequestError(`Role: "${role.name}" is already exists.`)
  }
}

/**
  * Get role by id
  * @param {Object} currentUser the user who perform this operation.
  * @param {String} id the role id
  * @param {Boolean} fromDb flag if query db for data or not
  * @returns {Object} the role
  */
async function getRole(id) {
  const role = await Role.findById(id)

  return role.toJSON()
}

getRole.schema = Joi.object().keys({
  id: Joi.string().uuid().required(),
  fromDb: Joi.boolean()
}).required()

/**
  * Create role
  * @param {Object} currentUser the user who perform this operation
  * @param {Object} role the role to be created
  * @returns {Object} the created role
  */
async function createRole(currentUser, role) {
  // check permission
  _checkUserPermissionForWriteDeleteRole(currentUser)
  // check if another Role with the same name exists.
  await _checkIfSameNamedRoleExists(role.name)

  role.createdBy = await helper.getUserId(currentUser.userId)

  const created = await Role.create(role)
  const entity = created.toJSON()
  return entity
}

createRole.schema = Joi.object().keys({
  currentUser: Joi.object().required(),
  role: Joi.object().keys({
    name: Joi.string().max(50).required(),
    description: Joi.string().max(1000),
    listOfSkills: Joi.array().items(Joi.string().max(50).required()),
    numberOfMembers: Joi.number().integer().min(1),
    imageUrl: Joi.string().uri().max(255)
  }).required()
}).required()

/**
  * Partially Update role
  * @param {Object} currentUser the user who perform this operation
  * @param {String} id the role id
  * @param {Object} data the data to be updated
  * @returns {Object} the updated role
  */
async function updateRole(currentUser, id, data) {
  // check permission
  _checkUserPermissionForWriteDeleteRole(currentUser)

  const role = await Role.findById(id)
  // if name is changed, check if another Role with the same name exists.
  if (data.name && data.name.toLowerCase() !== role.dataValues.name.toLowerCase()) {
    await _checkIfSameNamedRoleExists(data.name)
  }

  data.updatedBy = await helper.getUserId(currentUser.userId)
  const updated = await role.update(data)
  const entity = updated.toJSON()

  return entity
}

updateRole.schema = Joi.object().keys({
  currentUser: Joi.object().required(),
  id: Joi.string().uuid().required(),
  data: Joi.object().keys({
    name: Joi.string().max(50),
    description: Joi.string().max(1000).allow(null),
    listOfSkills: Joi.array().items(Joi.string().max(50).required()).allow(null)
  }).required()
}).required()

/**
  * Delete role by id
  * @param {Object} currentUser the user who perform this operation
  * @param {String} id the role id
  */
async function deleteRole(currentUser, id) {
  // check permission
  _checkUserPermissionForWriteDeleteRole(currentUser)

  const role = await Role.findById(id)
  await role.destroy()
}

deleteRole.schema = Joi.object().keys({
  currentUser: Joi.object().required(),
  id: Joi.string().uuid().required()
}).required()

/**
  * List roles
  * @param {Object} currentUser the user who perform this operation.
  * @param {Object} criteria the search criteria
  * @returns {Object} the search result
  */
async function searchRoles(currentUser, criteria) {
  const filter = { [Op.and]: [] }
  // Apply name filter, allow partial match and ignore case
  if (criteria.keyword) {
    filter[Op.and].push({ name: { [Op.iLike]: `%${criteria.keyword}%` } })
  }
  const queryCriteria = {
    where: filter,
    order: [['name', 'asc']]
  }
  const roles = await Role.findAll(queryCriteria)
  return roles
}

searchRoles.schema = Joi.object().keys({
  currentUser: Joi.object().required(),
  criteria: Joi.object().keys({
    keyword: Joi.string()
  }).required()
}).required()

module.exports = {
  getRole,
  createRole,
  updateRole,
  deleteRole,
  searchRoles
}
